"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletTransactionSchema = exports.bookingCreateSchema = exports.registerSchema = exports.loginSchema = void 0;
exports.validateBody = validateBody;
const zod_1 = require("zod");
/**
 * Higher-order middleware for Zod validation of request body
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
exports.loginSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string().min(10, 'Nambari ya simu lazima iwe na urefu usiopungua tarakimu 10').optional(),
    email: zod_1.z.string().email('Barua pepe si sahihi').optional(),
    password: zod_1.z.string().min(8, 'Nenosiri lazima liwe na urefu usiopungua herufi 8')
}).refine(data => data.phoneNumber || data.email, {
    message: 'Tafadhali ingiza ama namba ya simu au barua pepe',
    path: ['phoneNumber']
});
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3, 'Jina lazima liwe na urefu usiopungua herufi 3'),
    email: zod_1.z.string().email('Barua pepe si sahihi').optional().or(zod_1.z.literal('')),
    phoneNumber: zod_1.z.string().min(10, 'Namba ya simu lazima iwe ya usahihi'),
    password: zod_1.z.string().min(8, 'Nenosiri lazima liwe na herufi 8 au zaidi'),
    role: zod_1.z.enum(['customer', 'company', 'fundi', 'admin', 'super_admin']),
    referralCode: zod_1.z.string().optional(),
    professionId: zod_1.z.string().uuid('Profession ID lazima iwe UUID valid').optional(),
    experienceYears: zod_1.z.number().int().nonnegative().optional(),
    bio: zod_1.z.string().max(500, 'Bio isizidi herufi 500').optional(),
    startingPrice: zod_1.z.number().positive().optional(),
    regionId: zod_1.z.number().int().optional(),
    districtId: zod_1.z.number().int().optional(),
    wardId: zod_1.z.number().int().optional(),
    villageId: zod_1.z.number().int().optional(),
    latitude: zod_1.z.number().or(zod_1.z.string().transform(v => parseFloat(v))).optional(),
    longitude: zod_1.z.number().or(zod_1.z.string().transform(v => parseFloat(v))).optional(),
    workingDays: zod_1.z.array(zod_1.z.number()).optional(),
    workingHoursStart: zod_1.z.string().optional(),
    workingHoursEnd: zod_1.z.string().optional(),
    nationalIdNumber: zod_1.z.string().optional(),
    nationalIdUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    tinNumber: zod_1.z.string().optional(),
    tinCertificateUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    professionalCertificateUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    faceVerificationUrl: zod_1.z.string().url().optional().or(zod_1.z.literal(''))
});
exports.bookingCreateSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Customer ID lazima iwe UUID sahihi'),
    fundiId: zod_1.z.string().uuid('Fundi ID lazima iwe UUID sahihi'),
    professionId: zod_1.z.string().uuid('Profession ID lazima iwe UUID sahihi'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Muundo wa tarehe uwe YYYY-MM-DD'),
    time: zod_1.z.string(),
    address: zod_1.z.string().min(5, 'Anwani lazima iwe na maneno ya kutosha'),
    description: zod_1.z.string().optional(),
    photosUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
    servicePrice: zod_1.z.number().positive('Bei ya kazi lazima iwe kubwa kuliko sifuri').optional(),
    customerBudget: zod_1.z.number().positive('Bajeti lazima iwe kubwa kuliko sifuri').optional(),
    paymentOption: zod_1.z.string().optional(),
    corporateId: zod_1.z.string().uuid().optional(),
    isEmergency: zod_1.z.boolean().optional()
});
exports.walletTransactionSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Kiasi cha fedha lazima kiwe chanya'),
    paymentGateway: zod_1.z.enum(['azampay', 'mpesa', 'airtel', 'tigo', 'halopesa', 'selcom', 'pesapal', 'stripe', 'flutterwave', 'paypal']),
    reference: zod_1.z.string().min(5, 'Reference ya muamala ni lazima')
});
