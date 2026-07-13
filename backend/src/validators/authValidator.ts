import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const registerCustomerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().nullable(),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const registerFundiSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().nullable(),
  password: passwordSchema,
  primaryProfessionId: z.string().uuid('Invalid primary category ID').optional().nullable(),
  secondaryProfessionIds: z.array(z.string().uuid('Invalid category ID')).optional().default([]),
  categoryIds: z.array(z.string().uuid('Invalid category ID')).optional(),
  bio: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0, 'Experience years must be positive'),
  startingPrice: z.number().min(0, 'Starting price must be positive'),
  nationalIdNumber: z.string().min(5, 'National ID number must be specified'),
  education: z.string().optional().nullable(),
  languagesSpoken: z.string().optional().nullable(),
  workingRadius: z.number().optional().nullable(),
  emergencyService: z.boolean().optional().default(false),
  regionId: z.number().int().optional().nullable(),
  districtId: z.number().int().optional().nullable(),
  wardId: z.number().int().optional().nullable(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email').optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => data.email || data.phoneNumber, {
  message: 'Either email or phone number must be provided to log in',
  path: ['email']
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string(),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
  purpose: z.string().default('registration'),
});

export const resendOtpSchema = z.object({
  phoneNumber: z.string(),
  purpose: z.string().default('registration'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email').optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
}).refine(data => data.email || data.phoneNumber, {
  message: 'Either email or phone number must be provided',
  path: ['email']
});

export const resetPasswordSchema = z.object({
  phoneNumber: z.string(),
  code: z.string().length(6, 'OTP code must be 6 digits'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordSchema,
});
