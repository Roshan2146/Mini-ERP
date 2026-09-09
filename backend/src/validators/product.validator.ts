import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

export const createProductSchema = z.object({
  body: z.object({
    productName: z
      .string({ required_error: 'Product name is required' })
      .min(2, 'Product name must be at least 2 characters')
      .trim(),
    sku: z
      .string({ required_error: 'SKU is required' })
      .min(2, 'SKU must be at least 2 characters')
      .max(50, 'SKU is too long')
      .trim()
      .toUpperCase(),
    category: z
      .string({ required_error: 'Category is required' })
      .min(2, 'Category must be at least 2 characters')
      .trim(),
    unitPrice: z.coerce
      .number({ required_error: 'Unit price is required' })
      .min(0, 'Unit price must be greater than or equal to 0'),
    currentStock: z.coerce
      .number()
      .int('Stock must be an integer')
      .min(0, 'Current stock cannot be negative')
      .default(0),
    minimumStock: z.coerce
      .number()
      .int('Minimum stock threshold must be an integer')
      .min(0, 'Minimum stock cannot be negative')
      .default(5),
    warehouseLocation: z.string().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
  body: createProductSchema.shape.body.partial(),
});

export const getProductQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStockOnly: z.string().optional().transform((val) => val === 'true'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const stockMovementSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID'),
    quantity: z.coerce
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .positive('Quantity must be greater than zero'),
    reason: z
      .string({ required_error: 'Reason is required' })
      .min(2, 'Reason must be at least 2 characters')
      .trim(),
  }),
});

export const getMovementsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    productId: z.string().uuid().optional(),
    movementType: z.nativeEnum(StockMovementType).optional(),
  }),
});
