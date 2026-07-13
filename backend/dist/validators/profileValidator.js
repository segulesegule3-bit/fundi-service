"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateSchema = exports.portfolioItemSchema = exports.licenseSchema = exports.educationSchema = exports.certificateSchema = void 0;
const zod_1 = require("zod");
exports.certificateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    institution: zod_1.z.string().min(2, 'Institution must be at least 2 characters'),
    certificateNumber: zod_1.z.string().min(2, 'Certificate number must be at least 2 characters'),
    issueDate: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid issue date',
    }),
    expiryDate: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid expiry date',
    }).optional().nullable(),
    imageUrl: zod_1.z.string().optional().nullable(),
}).refine(data => {
    if (data.expiryDate && data.issueDate) {
        return Date.parse(data.expiryDate) > Date.parse(data.issueDate);
    }
    return true;
}, {
    message: 'Expiry date must be after issue date',
    path: ['expiryDate'],
});
exports.educationSchema = zod_1.z.object({
    institution: zod_1.z.string().min(2, 'Institution must be at least 2 characters'),
    course: zod_1.z.string().min(2, 'Course must be at least 2 characters'),
    level: zod_1.z.string().min(2, 'Level must be at least 2 characters'),
    startDate: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid start date',
    }),
    endDate: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid end date',
    }),
}).refine(data => {
    return Date.parse(data.endDate) > Date.parse(data.startDate);
}, {
    message: 'End date must be after start date',
    path: ['endDate'],
});
exports.licenseSchema = zod_1.z.object({
    licenseNumber: zod_1.z.string().min(2, 'License number must be at least 2 characters'),
    authority: zod_1.z.string().min(2, 'Authority must be at least 2 characters'),
    expiryDate: zod_1.z.string().refine(val => {
        const parsed = Date.parse(val);
        return !isNaN(parsed) && parsed > Date.now();
    }, {
        message: 'Expiry date must be in the future',
    }),
    credentialUrl: zod_1.z.string().optional().nullable(),
});
exports.portfolioItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
    description: zod_1.z.string().optional().nullable(),
    mediaUrls: zod_1.z.array(zod_1.z.string()).optional().default([]),
    videoUrl: zod_1.z.string().optional().nullable(),
    beforeImageUrl: zod_1.z.string().optional().nullable(),
    afterImageUrl: zod_1.z.string().optional().nullable(),
    completionDate: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid completion date',
    }),
    clientApproved: zod_1.z.boolean().optional().default(false),
    serviceCategory: zod_1.z.string().optional().nullable(),
    location: zod_1.z.string().optional().nullable(),
    clientReviewId: zod_1.z.string().uuid('Invalid review/booking ID').optional().nullable(),
});
exports.profileUpdateSchema = zod_1.z.object({
    bio: zod_1.z.string().optional().nullable(),
    experienceYears: zod_1.z.number().int().min(0).optional(),
    startingPrice: zod_1.z.number().positive().optional(),
    languagesSpoken: zod_1.z.array(zod_1.z.string()).optional(),
    serviceAreaType: zod_1.z.enum(['RADIUS', 'DISTRICT', 'REGION', 'NATION']).optional(),
    serviceAreaRadius: zod_1.z.number().positive().optional(),
    emergencyServiceEnabled: zod_1.z.boolean().optional(),
    vacationMode: zod_1.z.boolean().optional(),
    vacationStart: zod_1.z.string().refine(val => !val || !isNaN(Date.parse(val))).optional().nullable(),
    vacationEnd: zod_1.z.string().refine(val => !val || !isNaN(Date.parse(val))).optional().nullable(),
    workingDays: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional(),
    workingHoursStart: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
    workingHoursEnd: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
    lunchBreakStart: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional().nullable(),
    lunchBreakEnd: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional().nullable(),
    professions: zod_1.z.array(zod_1.z.object({
        professionId: zod_1.z.string().uuid(),
        isPrimary: zod_1.z.boolean().default(false),
        experienceYears: zod_1.z.number().int().min(0).default(0),
        skillLevel: zod_1.z.enum(['Beginner', 'Intermediate', 'Professional', 'Expert', 'Master']).default('Beginner'),
        startingPrice: zod_1.z.number().min(0).default(0),
        minimumPrice: zod_1.z.number().min(0).default(0),
        maximumPrice: zod_1.z.number().min(0).default(0),
        emergencyPrice: zod_1.z.number().min(0).default(0),
        weekendPrice: zod_1.z.number().min(0).default(0),
    })).optional(),
});
