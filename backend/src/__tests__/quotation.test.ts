import request from 'supertest';
import { app, server } from '../index';
import { db } from '../db';
import prisma from '../config/prisma';
import { AuthService } from '../services/authService';

describe('Quotation & Negotiation Pricing Workflow', () => {
  let customerToken: string;
  let fundiToken: string;
  let customerId: string;
  let fundiId: string;
  let professionId: string;
  let bookingId: string;

  beforeAll(async () => {
    try {
      // 1. Create a Category/Profession if not exists
      const category = await prisma.category.create({
        data: {
          nameEn: 'Plumber Test',
          nameSw: 'Fundi Mabomba Test',
          iconName: 'Wrench'
        }
      });
      professionId = category.id;
    } catch {
      professionId = 'c0fbe640-1cb2-4a4b-972d-450f3e670c82';
    }

    let customerUser: any = null;
    try {
      // 2. Create Customer User
      customerUser = await prisma.user.create({
        data: {
          phoneNumber: '+255999000' + Math.floor(100 + Math.random() * 900),
          passwordHash: 'dummy_hash',
          role: 'CUSTOMER',
          fullName: 'Customer Test'
        }
      });
      customerId = customerUser.id;
    } catch {
      customerId = 'c0fbe640-1cb2-4a4b-972d-450f3e670c83';
      customerUser = {
        id: customerId,
        phoneNumber: '+255999000111',
        role: 'customer',
        fullName: 'Customer Test'
      };
    }

    try {
      // Create wallet for customer
      await db.query('INSERT INTO wallets (user_id, balance, escrow_held) VALUES ($1, 200000.00, 0.00)', [customerId]);
    } catch {
      // Mock db handles queries automatically
    }

    const custTokens = AuthService.generateTokens(customerUser as any, 'session_cust');
    customerToken = custTokens.accessToken;

    let fundiUser: any = null;
    try {
      // 3. Create Fundi User & Profile
      fundiUser = await prisma.user.create({
        data: {
          phoneNumber: '+255999000' + Math.floor(100 + Math.random() * 900),
          passwordHash: 'dummy_hash',
          role: 'FUNDI',
          fullName: 'Fundi Test'
        }
      });
      fundiId = fundiUser.id;
    } catch {
      fundiId = 'c0fbe640-1cb2-4a4b-972d-450f3e670c84';
      fundiUser = {
        id: fundiId,
        phoneNumber: '+255999000222',
        role: 'fundi',
        fullName: 'Fundi Test'
      };
    }

    try {
      await prisma.fundiProfile.create({
        data: {
          userId: fundiId,
          bio: 'Expert test fundi',
          experienceYears: 5,
          startingPrice: 15000.00,
          inspectionFee: 8000.00,
          languagesSpoken: 'Swahili',
          languagesSpokenList: ['Swahili'],
          serviceAreaType: 'RADIUS',
          serviceAreaRadius: 15
        }
      });
    } catch {
      // Mock db fallback
    }

    try {
      // Create fundi profession mapping
      await prisma.fundiProfession.create({
        data: {
          fundiId,
          professionId,
          startingPrice: 15000.00,
          inspectionFee: 8000.00,
          skillLevel: 'Expert'
        }
      });
    } catch {
      // Mock db fallback
    }

    const fTokens = AuthService.generateTokens(fundiUser as any, 'session_fundi');
    fundiToken = fTokens.accessToken;
  });

  afterAll(async () => {
    try {
      // Clean up created records to keep database clean
      if (bookingId) {
        await db.query('DELETE FROM payments WHERE booking_id = $1', [bookingId]);
        await db.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
      }
      await db.query('DELETE FROM wallets WHERE user_id = $1', [customerId]);
      await db.query('DELETE FROM fundi_professions WHERE "fundiId" = $1', [fundiId]);
      await db.query('DELETE FROM fundi_profiles WHERE user_id = $1', [fundiId]);
      await db.query('DELETE FROM users WHERE id IN ($1, $2)', [customerId, fundiId]);
      await db.query('DELETE FROM professions WHERE id = $1', [professionId]);
    } catch {
      // Mock db ignores deletion errors
    }

    server.close();
    try {
      await db.close();
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
  });

  describe('Booking Request with Quotation-Based fields', () => {
    it('should create booking and populate AI estimation, starting price, and inspection fee', async () => {
      const res = await request(app)
        .post('/api/bookings/create')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId,
          fundiId,
          professionId,
          date: '2026-12-01',
          time: '10:00 AM',
          address: 'Mikocheni B, Dar',
          description: 'Fixing test sink leak',
          customerBudget: 50000
        });

      expect(res.status).toBe(201);
      expect(res.body.booking).toHaveProperty('id');
      bookingId = res.body.booking.id;

      // Check new fields are resolved
      const checkRes = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      const row = checkRes.rows[0];
      expect(parseFloat(row.starting_price)).toBe(15000.00);
      expect(parseFloat(row.inspection_fee)).toBe(8000.00);
      expect(parseFloat(row.customer_budget)).toBe(50000.00);
      expect(parseFloat(row.ai_estimated_min)).toBeGreaterThan(0);
      expect(parseFloat(row.ai_estimated_max)).toBeGreaterThan(0);
      expect(row.status).toBe('pending');
    });
  });

  describe('Quotation Submission & Negotiation counter offers', () => {
    it('should submit quotation by fundi and send update to chat', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingId}/quote`)
        .set('Authorization', `Bearer ${fundiToken}`)
        .send({
          price: 45000,
          arrivalTime: '1 hour',
          completionTime: '3 hours',
          notes: 'Requires new piping'
        });

      expect(res.status).toBe(200);

      const checkRes = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      const row = checkRes.rows[0];
      expect(parseFloat(row.fundi_quote_price)).toBe(45000.00);
      expect(row.fundi_quote_arrival).toBe('1 hour');
      expect(row.fundi_quote_completion).toBe('3 hours');
      expect(row.negotiation_status).toBe('quoted');
      expect(row.last_negotiated_by).toBe('fundi');
    });

    it('should propose counter offer by customer', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingId}/negotiate`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          counterPrice: 40000,
          notes: 'Can you do 40k?',
          counterBy: 'customer'
        });

      expect(res.status).toBe(200);

      const checkRes = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      const row = checkRes.rows[0];
      expect(parseFloat(row.last_negotiation_price)).toBe(40000.00);
      expect(row.negotiation_status).toBe('countered_by_customer');
      expect(row.last_negotiated_by).toBe('customer');
    });
  });

  describe('Acceptance, locking price, and holding escrow', () => {
    it('should accept quotation and lock funds in escrow', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingId}/accept-quote`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send();

      expect(res.status).toBe(200);

      // Verify status is PRICE_CONFIRMED and final price is correct
      const checkRes = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      const row = checkRes.rows[0];
      expect(row.status).toBe('price_confirmed');
      expect(row.negotiation_status).toBe('agreed');
      expect(parseFloat(row.final_agreed_price)).toBe(40000.00);

      // Verify customer wallet escrow hold
      const walletRes = await db.query('SELECT balance, escrow_held FROM wallets WHERE user_id = $1', [customerId]);
      const wallet = walletRes.rows[0];
      expect(parseFloat(wallet.balance)).toBe(160000.00); // 200000 - 40000
      expect(parseFloat(wallet.escrow_held)).toBe(40000.00);
    });
  });
});
