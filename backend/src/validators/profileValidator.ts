import { z } from 'zod';

export const certificateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  institution: z.string().min(2, 'Institution must be at least 2 characters'),
  certificateNumber: z.string().min(2, 'Certificate number must be at least 2 characters'),
  issueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid issue date',
  }),
  expiryDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid expiry date',
  }).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
}).refine(data => {
  if (data.expiryDate && data.issueDate) {
    return Date.parse(data.expiryDate) > Date.parse(data.issueDate);
  }
  return true;
}, {
  message: 'Expiry date must be after issue date',
  path: ['expiryDate'],
});

export const educationSchema = z.object({
  institution: z.string().min(2, 'Institution must be at least 2 characters'),
  course: z.string().min(2, 'Course must be at least 2 characters'),
  level: z.string().min(2, 'Level must be at least 2 characters'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid end date',
  }),
}).refine(data => {
  return Date.parse(data.endDate) > Date.parse(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const licenseSchema = z.object({
  licenseNumber: z.string().min(2, 'License number must be at least 2 characters'),
  authority: z.string().min(2, 'Authority must be at least 2 characters'),
  expiryDate: z.string().refine(val => {
    const parsed = Date.parse(val);
    return !isNaN(parsed) && parsed > Date.now();
  }, {
    message: 'Expiry date must be in the future',
  }),
  credentialUrl: z.string().optional().nullable(),
});

export const portfolioItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  mediaUrls: z.array(z.string()).optional().default([]),
  videoUrl: z.string().optional().nullable(),
  beforeImageUrl: z.string().optional().nullable(),
  afterImageUrl: z.string().optional().nullable(),
  completionDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid completion date',
  }),
  clientApproved: z.boolean().optional().default(false),
  serviceCategory: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  clientReviewId: z.string().uuid('Invalid review/booking ID').optional().nullable(),
});

export const profileUpdateSchema = z.object({
  bio: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional(),
  startingPrice: z.number().positive().optional(),
  languagesSpoken: z.array(z.string()).optional(),
  serviceAreaType: z.enum(['RADIUS', 'DISTRICT', 'REGION', 'NATION']).optional(),
  serviceAreaRadius: z.number().positive().optional(),
  emergencyServiceEnabled: z.boolean().optional(),
  vacationMode: z.boolean().optional(),
  vacationStart: z.string().refine(val => !val || !isNaN(Date.parse(val))).optional().nullable(),
  vacationEnd: z.string().refine(val => !val || !isNaN(Date.parse(val))).optional().nullable(),
  workingDays: z.array(z.number().int().min(0).max(6)).optional(),
  workingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
  workingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
  lunchBreakStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional().nullable(),
  lunchBreakEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional().nullable(),
  professions: z.array(z.object({
    professionId: z.string().uuid(),
    isPrimary: z.boolean().default(false),
    experienceYears: z.number().int().min(0).default(0),
    skillLevel: z.enum(['Beginner', 'Intermediate', 'Professional', 'Expert', 'Master']).default('Beginner'),
    startingPrice: z.number().min(0).default(0),
    minimumPrice: z.number().min(0).default(0),
    maximumPrice: z.number().min(0).default(0),
    emergencyPrice: z.number().min(0).default(0),
    weekendPrice: z.number().min(0).default(0),
  })).optional(),
});
