/**
 * @fileoverview Common form validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Common validation messages
 */
export const ValidationMessages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: {
        min: 'Password must be at least 8 characters',
        max: 'Password must be less than 100 characters',
        uppercase: 'Password must contain at least one uppercase letter',
        lowercase: 'Password must contain at least one lowercase letter',
        number: 'Password must contain at least one number',
        special: 'Password must contain at least one special character',
    },
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    age: {
        min: 'You must be at least 18 years old',
        max: 'Age cannot be more than 120 years',
    },
} as const;

/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .min(1, ValidationMessages.required)
    .email(ValidationMessages.email);

/**
 * Password validation schema with security requirements
 */
export const passwordSchema = z
    .string()
    .min(8, ValidationMessages.password.min)
    .max(100, ValidationMessages.password.max)
    .regex(/[A-Z]/, ValidationMessages.password.uppercase)
    .regex(/[a-z]/, ValidationMessages.password.lowercase)
    .regex(/[0-9]/, ValidationMessages.password.number)
    .regex(/[^A-Za-z0-9]/, ValidationMessages.password.special);

/**
 * Phone number validation schema
 */
export const phoneSchema = z
    .string()
    .min(1, ValidationMessages.required)
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/, ValidationMessages.phone);

/**
 * URL validation schema
 */
export const urlSchema = z
    .string()
    .min(1, ValidationMessages.required)
    .url(ValidationMessages.url);

/**
 * Age validation schema
 */
export const ageSchema = z
    .number()
    .min(18, ValidationMessages.age.min)
    .max(120, ValidationMessages.age.max);

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, ValidationMessages.required),
    rememberMe: z.boolean().optional(),
});

/**
 * Registration form validation schema
 */
export const registrationSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1, ValidationMessages.required),
    lastName: z.string().min(1, ValidationMessages.required),
    phone: phoneSchema.optional(),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
    firstName: z.string().min(1, ValidationMessages.required),
    lastName: z.string().min(1, ValidationMessages.required),
    email: emailSchema,
    phone: phoneSchema.optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    website: urlSchema.optional(),
    location: z.string().optional(),
});
