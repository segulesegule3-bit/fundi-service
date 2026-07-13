"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendOtpSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerFundiSchema = exports.registerCustomerSchema = void 0;
const zod_1 = require("zod");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
exports.registerCustomerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
    email: zod_1.z.string().email('Invalid email address').optional().nullable(),
    password: passwordSchema,
    confirmPassword: zod_1.z.string(),
    acceptTerms: zod_1.z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
exports.registerFundiSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
    email: zod_1.z.string().email('Invalid email address').optional().nullable(),
    password: passwordSchema,
    primaryProfessionId: zod_1.z.string().uuid('Invalid primary category ID').optional().nullable(),
    secondaryProfessionIds: zod_1.z.array(zod_1.z.string().uuid('Invalid category ID')).optional().default([]),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid('Invalid category ID')).optional(),
    bio: zod_1.z.string().optional().nullable(),
    experienceYears: zod_1.z.number().int().min(0, 'Experience years must be positive'),
    startingPrice: zod_1.z.number().min(0, 'Starting price must be positive'),
    nationalIdNumber: zod_1.z.string().min(5, 'National ID number must be specified'),
    education: zod_1.z.string().optional().nullable(),
    languagesSpoken: zod_1.z.string().optional().nullable(),
    workingRadius: zod_1.z.number().optional().nullable(),
    emergencyService: zod_1.z.boolean().optional().default(false),
    regionId: zod_1.z.number().int().optional().nullable(),
    districtId: zod_1.z.number().int().optional().nullable(),
    wardId: zod_1.z.number().int().optional().nullable(),
    acceptTerms: zod_1.z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email').optional().nullable(),
    phoneNumber: zod_1.z.string().optional().nullable(),
    password: zod_1.z.string().min(1, 'Password is required'),
}).refine(data => data.email || data.phoneNumber, {
    message: 'Either email or phone number must be provided to log in',
    path: ['email']
});
exports.verifyOtpSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string(),
    code: zod_1.z.string().length(6, 'OTP must be exactly 6 digits'),
    purpose: zod_1.z.string().default('registration'),
});
exports.resendOtpSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string(),
    purpose: zod_1.z.string().default('registration'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email').optional().nullable(),
    phoneNumber: zod_1.z.string().optional().nullable(),
}).refine(data => data.email || data.phoneNumber, {
    message: 'Either email or phone number must be provided',
    path: ['email']
});
exports.resetPasswordSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string(),
    code: zod_1.z.string().length(6, 'OTP code must be 6 digits'),
    newPassword: passwordSchema,
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: passwordSchema,
});
