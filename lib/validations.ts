import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

// Sign-in schema
export const signInSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Job schema
export const jobSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  salary: z.string().optional(),
  description: z.string().min(1, { message: 'Description is required' }),
  requirements: z.string().min(1, { message: 'Requirements are required' }),
  resumeRequired: z.boolean().default(false),
  customFields: z
    .array(
      z.object({
        id: z.string().min(1, { message: 'Custom field ID is required' }).uuid({ message: 'Custom field ID must be a valid UUID' }),
        label: z.string().min(1, { message: 'Custom field label is required' }),
        type: z.enum(['text', 'textarea', 'select', 'radio']),
        required: z.boolean(),
        options: z.array(z.string().min(1, { message: 'Option cannot be empty' })).optional(),
      }),
    )
    .optional()
    .refine(
      (fields) =>
        !fields ||
        fields.every((field) => (['select', 'radio'].includes(field.type) ? field.options && field.options.length > 0 : true)),
      { message: 'Select and radio fields must have non-empty options' },
    ),
});

// Application schema
export const applicationSchema = z.object({
  jobId: z.string().min(1, { message: 'Job ID is required' }),
  answers: z.record(z.string(), z.unknown()).optional(),
  resumeUrl: z.url({ message: 'Resume URL must be a valid URL' }).optional(),
});

// Profile schema
export const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    .optional(),
  location: z.string().min(1, { message: 'Location cannot be empty' }).optional(),
});