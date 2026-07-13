import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Higher-order middleware for Zod validation of request body
 */
export function validateBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({ 
          error: 'Input validation failed', 
          details: formattedErrors 
        });
        return;
      }
      res.status(500).json({ error: 'Internal validation server error' });
    }
  };
}

// ==========================================
// SECURITY VALIDATION SCHEMAS
// ==========================================

export const loginSchema = z.object({
  phoneNumber: z.string().min(10, 'Nambari ya simu lazima iwe na urefu usiopungua tarakimu 10').optional(),
  email: z.string().email('Barua pepe si sahihi').optional(),
  password: z.string().min(8, 'Nenosiri lazima liwe na urefu usiopungua herufi 8')
}).refine(data => data.phoneNumber || data.email, {
  message: 'Tafadhali ingiza ama namba ya simu au barua pepe',
  path: ['phoneNumber']
});

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Jina lazima liwe na urefu usiopungua herufi 3'),
  email: z.string().email('Barua pepe si sahihi').optional().or(z.literal('')),
  phoneNumber: z.string().min(10, 'Namba ya simu lazima iwe ya usahihi'),
  password: z.string().min(8, 'Nenosiri lazima liwe na herufi 8 au zaidi'),
  role: z.enum(['customer', 'company', 'fundi', 'admin', 'super_admin']),
  referralCode: z.string().optional(),
  professionId: z.string().uuid('Profession ID lazima iwe UUID valid').optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  bio: z.string().max(500, 'Bio isizidi herufi 500').optional(),
  startingPrice: z.number().positive().optional(),
  regionId: z.number().int().optional(),
  districtId: z.number().int().optional(),
  wardId: z.number().int().optional(),
  villageId: z.number().int().optional(),
  latitude: z.number().or(z.string().transform(v => parseFloat(v))).optional(),
  longitude: z.number().or(z.string().transform(v => parseFloat(v))).optional(),
  workingDays: z.array(z.number()).optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  nationalIdNumber: z.string().optional(),
  nationalIdUrl: z.string().url().optional().or(z.literal('')),
  tinNumber: z.string().optional(),
  tinCertificateUrl: z.string().url().optional().or(z.literal('')),
  professionalCertificateUrl: z.string().url().optional().or(z.literal('')),
  faceVerificationUrl: z.string().url().optional().or(z.literal(''))
});

export const bookingCreateSchema = z.object({
  customerId: z.string().uuid('Customer ID lazima iwe UUID sahihi'),
  fundiId: z.string().uuid('Fundi ID lazima iwe UUID sahihi'),
  professionId: z.string().uuid('Profession ID lazima iwe UUID sahihi'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Muundo wa tarehe uwe YYYY-MM-DD'),
  time: z.string(),
  address: z.string().min(5, 'Anwani lazima iwe na maneno ya kutosha'),
  description: z.string().optional(),
  photosUrls: z.array(z.string().url()).optional(),
  servicePrice: z.number().positive('Bei ya kazi lazima iwe kubwa kuliko sifuri').optional(),
  customerBudget: z.number().positive('Bajeti lazima iwe kubwa kuliko sifuri').optional(),
  paymentOption: z.string().optional(),
  corporateId: z.string().uuid().optional(),
  isEmergency: z.boolean().optional()
});

export const walletTransactionSchema = z.object({
  amount: z.number().positive('Kiasi cha fedha lazima kiwe chanya'),
  paymentGateway: z.enum(['azampay', 'mpesa', 'airtel', 'tigo', 'halopesa', 'selcom', 'pesapal', 'stripe', 'flutterwave', 'paypal']),
  reference: z.string().min(5, 'Reference ya muamala ni lazima')
});
