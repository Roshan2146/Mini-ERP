import { z } from 'zod';
import { CustomerType, CustomerStatus, FollowUpStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  body: z.object({
    customerName: z
      .string({ required_error: 'Customer name is required' })
      .min(2, 'Customer name must be at least 2 characters')
      .trim(),
    mobileNumber: z
      .string({ required_error: 'Mobile number is required' })
      .min(7, 'Please provide a valid phone/mobile number')
      .max(20, 'Mobile number too long')
      .trim(),
    email: z
      .string()
      .email('Invalid email address format')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    businessName: z
      .string({ required_error: 'Business name is required' })
      .min(2, 'Business name must be at least 2 characters')
      .trim(),
    gstNumber: z
      .string()
      .max(25, 'GST Number is too long')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    customerType: z.nativeEnum(CustomerType, {
      errorMap: () => ({ message: 'Customer type must be RETAIL, WHOLESALE, or DISTRIBUTOR' }),
    }),
    address: z
      .string({ required_error: 'Address is required' })
      .min(3, 'Please provide a full address')
      .trim(),
    status: z
      .nativeEnum(CustomerStatus, {
        errorMap: () => ({ message: 'Status must be LEAD, ACTIVE, or INACTIVE' }),
      })
      .default(CustomerStatus.LEAD),
    followUpDate: z
      .string()
      .datetime({ offset: true })
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
      .transform((val) => (val ? new Date(val) : undefined)),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
  body: createCustomerSchema.shape.body.partial(),
});

export const getCustomerQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    customerType: z.nativeEnum(CustomerType).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
  body: z.object({
    notes: z
      .string({ required_error: 'Follow-up notes are required' })
      .min(3, 'Notes must have meaningful content')
      .trim(),
    followUpDate: z
      .string({ required_error: 'Follow-up date is required' })
      .transform((val) => new Date(val)),
    status: z
      .nativeEnum(FollowUpStatus)
      .default(FollowUpStatus.PENDING),
  }),
});
