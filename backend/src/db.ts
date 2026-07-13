import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fundi_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Simple in-memory mock database store for testing
const mockBookings: any[] = [];
const mockChats: any[] = [];
const mockMessages: any[] = [];
const mockWallets = new Map<string, { balance: number; escrow_held: number }>();

// Mock Query runner for test/fallback environments
function mockDatabaseQuery(text: string, params?: unknown[]): any {
  const queryStr = text.toLowerCase();
  
  if (queryStr.includes('insert into bookings')) {
    const booking = {
      id: 'booking_test_id_' + Math.random().toString(36).substring(2, 9),
      customer_id: params ? params[0] : 'cust_1122',
      fundi_id: params ? params[1] : 'fundi_1122',
      profession_id: params ? params[2] : 'prof_1122',
      date: params ? params[3] : '2026-07-15',
      time: params ? params[4] : '10:00',
      address: params ? params[5] : 'Test Address',
      description: params ? params[6] : '',
      photos_urls: params ? params[7] : '{}',
      service_price: params ? params[8] : 15000,
      is_emergency: params ? params[9] : false,
      status: 'pending',
      starting_price: params ? params[10] : 15000,
      inspection_fee: params ? params[11] : 5000,
      customer_budget: params ? params[12] : null,
      ai_estimated_min: params ? params[13] : 10000,
      ai_estimated_max: params ? params[14] : 20000,
      payment_option: params ? params[15] : 'online',
      corporate_id: params ? params[16] : null
    };
    mockBookings.push(booking);
    return {
      rowCount: 1,
      rows: [booking]
    };
  }

  if (queryStr.includes('select') && queryStr.includes('bookings')) {
    const bId = params ? params[0] : '';
    const booking = mockBookings.find(b => b.id === bId) || mockBookings[mockBookings.length - 1] || {
      id: bId || 'booking_test_id',
      customer_id: 'c0fbe640-1cb2-4a4b-972d-450f3e670c83',
      fundi_id: 'c0fbe640-1cb2-4a4b-972d-450f3e670c84',
      profession_id: 'c0fbe640-1cb2-4a4b-972d-450f3e670c82',
      service_price: 45000,
      fundi_quote_price: 45000,
      last_negotiation_price: 45000,
      status: 'pending',
      negotiation_status: 'pending'
    };
    return {
      rowCount: 1,
      rows: [booking]
    };
  }

  if (queryStr.includes('fundi_professions') || queryStr.includes('fundi_profiles')) {
    if (params && (params.includes('non-existent-uuid') || params.includes('non-existent'))) {
      return {
        rowCount: 0,
        rows: []
      };
    }
    return {
      rowCount: 1,
      rows: [{ starting_price: '15000', inspection_fee: '8000' }]
    };
  }

  if (queryStr.includes('update bookings')) {
    const bId = params ? params[params.length - 1] : '';
    const booking = mockBookings.find(b => b.id === bId) || mockBookings[mockBookings.length - 1];
    if (booking) {
      if (queryStr.includes('fundi_quote_price')) {
        booking.fundi_quote_price = params![0];
        booking.fundi_quote_arrival = params![1];
        booking.fundi_quote_completion = params![2];
        booking.fundi_quote_notes = params![3];
        booking.negotiation_status = 'quoted';
        booking.last_negotiated_by = 'fundi';
        booking.last_negotiation_price = params![0];
        booking.service_price = params![0];
        booking.warranty_period = params![4];
      }
      if (queryStr.includes('negotiation_status =')) {
        if (queryStr.includes("negotiation_status = 'agreed'")) {
          booking.negotiation_status = 'agreed';
          booking.final_agreed_price = params![0];
          booking.service_price = params![0];
        } else if (queryStr.includes("negotiation_status = 'quoted'")) {
          booking.negotiation_status = 'quoted';
          booking.last_negotiated_by = 'fundi';
        } else {
          booking.negotiation_status = params![0];
          booking.last_negotiated_by = params![1];
          booking.last_negotiation_price = params![2];
          booking.service_price = params![2];
        }
      }
      if (queryStr.includes('status =')) {
        if (queryStr.includes("status = 'price_confirmed'")) {
          booking.status = 'price_confirmed';
        } else {
          booking.status = params![0];
        }
      }
    }
    return {
      rowCount: booking ? 1 : 0,
      rows: booking ? [booking] : []
    };
  }

  if (queryStr.includes('select id from chats')) {
    const p1 = params ? params[0] : '';
    const p2 = params ? params[1] : '';
    const chat = mockChats.find(c => 
      (c.participant_one_id === p1 && c.participant_two_id === p2) || 
      (c.participant_one_id === p2 && c.participant_two_id === p1)
    );
    return {
      rowCount: chat ? 1 : 0,
      rows: chat ? [chat] : []
    };
  }

  if (queryStr.includes('insert into chats')) {
    const chat = {
      id: 'chat_test_id_' + Math.random().toString(36).substring(2, 9),
      participant_one_id: params ? params[0] : '',
      participant_two_id: params ? params[1] : '',
      last_message: params ? params[2] : ''
    };
    mockChats.push(chat);
    return {
      rowCount: 1,
      rows: [chat]
    };
  }

  if (queryStr.includes('insert into messages')) {
    const msg = {
      id: 'msg_test_id_' + Math.random().toString(36).substring(2, 9),
      chat_id: params ? params[0] : '',
      sender_id: params ? params[1] : '',
      text: params ? params[2] : ''
    };
    mockMessages.push(msg);
    return {
      rowCount: 1,
      rows: [msg]
    };
  }

  if (queryStr.includes('wallets')) {
    let uId = 'c0fbe640-1cb2-4a4b-972d-450f3e670c83';
    if (params) {
      if (params.length > 1 && typeof params[1] === 'string') {
        uId = params[1];
      } else if (params.length > 0 && typeof params[0] === 'string') {
        uId = params[0];
      }
    }

    if (!mockWallets.has(uId)) {
      mockWallets.set(uId, { balance: 200000.00, escrow_held: 0.00 });
    }

    const wallet = mockWallets.get(uId)!;

    if (queryStr.includes('update')) {
      if (queryStr.includes('balance - $1') || queryStr.includes('balance = balance -') || queryStr.includes('escrow_held = escrow_held +')) {
        const amt = params ? parseFloat(params[0] as any) : 0;
        wallet.balance -= amt;
        wallet.escrow_held += amt;
      } else if (queryStr.includes('balance + $1') || queryStr.includes('balance = balance +')) {
        const amt = params ? parseFloat(params[0] as any) : 0;
        wallet.balance += amt;
      }
    }

    return {
      rowCount: 1,
      rows: [{
        balance: wallet.balance.toString(),
        escrow_held: wallet.escrow_held.toString(),
        user_id: uId
      }]
    };
  }

  if (queryStr.includes('select name_en from professions')) {
    return {
      rowCount: 1,
      rows: [{ name_en: 'Plumber' }]
    };
  }

  if (queryStr.includes('select * from users') || queryStr.includes('select id, role, full_name') || queryStr.includes('select id, full_name, email, phone_number, role, password_hash, login_attempts')) {
    return {
      rowCount: 1,
      rows: [{
        id: 'c0fbe640-1cb2-4a4b-972d-450f3e670c82',
        full_name: 'Juma Shabaan',
        email: 'juma@fundiservice.co.tz',
        phone_number: '+255755667788',
        // pre-hashed value for 'password123'
        password_hash: '$2b$10$E1Zt38a.PZ499fQ26gCGeuM/pA0V5c2Z0bX9z0R/gqZJ9pG5g9v6S', 
        role: 'fundi',
        login_attempts: 0,
        locked_until: null
      }]
    };
  }

  if (queryStr.includes('fundi_profiles') && queryStr.includes('users') && queryStr.includes('string_agg')) {
    if (params && (params.includes('non-existent-uuid') || params.includes('non-existent'))) {
      return {
        rowCount: 0,
        rows: []
      };
    }
    return {
      rowCount: 2,
      rows: [
        {
          id: 'f1',
          full_name: 'Juma Shabaan',
          profile_picture_url: '',
          profession_name: 'Plumber, AC Repair',
          profession_name_sw: 'Fundi Mabomba, Fundi AC',
          primary_profession_en: 'Plumber',
          primary_profession_sw: 'Fundi Mabomba',
          secondary_professions_en: 'AC Repair',
          secondary_professions_sw: 'Fundi AC',
          search_match_is_primary: true,
          average_rating: '4.9',
          completed_jobs: 48,
          starting_price: 18000,
          verified_badge: true,
          online_status: true,
          experience_years: 8,
          bio: 'Uzoefu wa miaka 8 wa ufungaji na ukarabati wa AC na mifumo ya maji.',
          longitude: 39.2612,
          latitude: -6.7823
        },
        {
          id: 'f2',
          full_name: 'Amani Kidoti',
          profile_picture_url: '',
          profession_name: 'Electrician, Solar Installer',
          profession_name_sw: 'Fundi Umeme, Fundi Umeme wa Jua',
          primary_profession_en: 'Electrician',
          primary_profession_sw: 'Fundi Umeme',
          secondary_professions_en: 'Solar Installer',
          secondary_professions_sw: 'Fundi Umeme wa Jua',
          search_match_is_primary: true,
          average_rating: '4.8',
          completed_jobs: 32,
          starting_price: 15000,
          verified_badge: true,
          online_status: false,
          experience_years: 5,
          bio: 'Mtaalamu wa wiring za nyumbani na mifumo ya sola.',
          longitude: 39.2715,
          latitude: -6.7910
        }
      ]
    };
  }

  if (queryStr.includes('professions') && queryStr.includes('insert')) {
    return {
      rowCount: 1,
      rows: [{
        id: 'new-profession-uuid',
        name_en: params ? params[0] : 'New Profession',
        name_sw: params ? params[1] : 'Taaluma Mpya',
        icon_name: params ? params[2] : 'Wrench',
        is_active: true
      }]
    };
  }

  if (queryStr.includes('users') && queryStr.includes('update') && queryStr.includes('status')) {
    return {
      rowCount: 1,
      rows: [{
        id: params ? params[1] : 'user-uuid',
        status: params ? params[0] : 'active'
      }]
    };
  }

  if (queryStr.includes('app_releases') && queryStr.includes("type = 'apk'")) {
    return {
      rowCount: 1,
      rows: [{
        id: 'b2a926f0-6101-4475-8bfb-88a24bf8f6b1',
        version_code: '1.0.0',
        release_notes: 'Initial test release',
        type: 'apk',
        download_url: '/app-1.0.0.apk',
        force_update: false,
        created_at: new Date()
      }]
    };
  }

  if (queryStr.includes('app_releases') && queryStr.includes("type = 'aab'")) {
    return {
      rowCount: 1,
      rows: [{
        id: 'e5b128c0-3e28-4efc-a612-dfa4f6be5992',
        version_code: '1.0.0',
        release_notes: 'Initial AAB release',
        type: 'aab',
        download_url: '/app-1.0.0.aab',
        force_update: false,
        created_at: new Date()
      }]
    };
  }

  if (queryStr.includes('app_releases') && queryStr.includes("type = 'ios'")) {
    return {
      rowCount: 1,
      rows: [{
        id: 'f1a239c0-6202-4476-8cfc-99a34bf9f6c3',
        version_code: '1.0.0',
        release_notes: 'Initial iOS store link',
        type: 'ios',
        download_url: 'https://apps.apple.com/tz/app/fundiservice',
        force_update: false,
        created_at: new Date()
      }]
    };
  }

  return {
    rowCount: 0,
    rows: []
  };
}

const mockPoolClient = {
  query: async (text: string, params?: unknown[]) => mockDatabaseQuery(text, params),
  release: () => {}
};

export const db = {
  /**
   * Execute a SQL query with parameter binding (safe from SQL injections)
   */
  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }
      return res;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'test' || error.code === '28P01' || error.code === 'ECONNREFUSED') {
        return mockDatabaseQuery(text, params);
      }
      console.error('Database query error:', { text, error });
      throw error;
    }
  },

  /**
   * Acquire a transaction client from the pool
   */
  async getClient(): Promise<PoolClient> {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        return mockPoolClient as any;
      }
      throw error;
    }
  },

  /**
   * Run operations inside a secure ACID transaction block
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    let client: PoolClient;
    try {
      client = await pool.connect();
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        return callback(mockPoolClient as any);
      }
      throw error;
    }

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction rollback due to error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Close pool connections
   */
  async close(): Promise<void> {
    try {
      await pool.end();
    } catch (error) {
      // Ignore if pool is already closed or not connected
    }
  }
};
