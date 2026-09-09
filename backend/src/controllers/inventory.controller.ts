import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { Prisma, StockMovementType } from '@prisma/client';

export const getInventorySummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        productName: true,
        sku: true,
        category: true,
        unitPrice: true,
        currentStock: true,
        minimumStock: true,
        warehouseLocation: true,
        updatedAt: true,
      },
      orderBy: { productName: 'asc' },
    });

    const totalProducts = products.length;
    const totalInventoryQuantity = products.reduce((acc, p) => acc + p.currentStock, 0);
    const lowStockProducts = products.filter((p) => p.currentStock <= p.minimumStock);
    const outOfStockProducts = products.filter((p) => p.currentStock === 0);

    const totalValuation = products.reduce(
      (acc, p) => acc + p.currentStock * Number(p.unitPrice),
      0
    );

    return ApiResponse.success(
      res,
      {
        totalProducts,
        totalInventoryQuantity,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalValuation,
        items: products.map((p) => ({
          ...p,
          isLowStock: p.currentStock <= p.minimumStock,
          isOutOfStock: p.currentStock === 0,
        })),
      },
      'Inventory overview retrieved successfully'
    );
  } catch (error) {
    return next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const productId = req.query.productId as string;
    const movementType = req.query.movementType as StockMovementType;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, productName: true, sku: true, category: true, unitPrice: true },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return ApiResponse.paginated(
      res,
      movements,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'Stock movement history retrieved'
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * STOCK IN TRANSACTION
 * 1. Validate product exists
 * 2. Validate quantity > 0
 * 3. Increase currentStock
 * 4. Record IN movement
 * In single database transaction
 */
export const recordStockIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user?.id;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return next(AppError.badRequest('Quantity must be a positive integer'));
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw AppError.notFound(`Product with ID '${productId}' not found`);
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            increment: qty,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          movementType: 'IN',
          reason: reason || 'MANUAL_RESTOCK',
          createdById: userId,
        },
        include: {
          product: {
            select: { id: true, productName: true, sku: true },
          },
        },
      });

      return { product: updatedProduct, movement };
    });

    return ApiResponse.success(
      res,
      result,
      `Successfully added ${qty} units of stock. New stock is ${result.product.currentStock}.`,
      201
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * STOCK OUT TRANSACTION
 * 1. Validate product exists
 * 2. Validate quantity > 0
 * 3. Validate currentStock >= quantity (Zero / Negative Stock Violation Guard)
 * 4. Decrease currentStock
 * 5. Record OUT movement
 * In single database transaction
 */
export const recordStockOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user?.id;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return next(AppError.badRequest('Quantity must be a positive integer'));
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw AppError.notFound(`Product with ID '${productId}' not found`);
      }

      // STRICT BUSINESS RULE: STOCK MUST NEVER BECOME NEGATIVE
      if (product.currentStock < qty) {
        throw AppError.badRequest(
          `Insufficient stock for '${product.productName}' (${product.sku}). Available: ${product.currentStock}, Requested: ${qty}`
        );
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            decrement: qty,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          movementType: 'OUT',
          reason: reason || 'MANUAL_DISPATCH',
          createdById: userId,
        },
        include: {
          product: {
            select: { id: true, productName: true, sku: true },
          },
        },
      });

      return { product: updatedProduct, movement };
    });

    return ApiResponse.success(
      res,
      result,
      `Successfully deducted ${qty} units of stock. Remaining stock is ${result.product.currentStock}.`
    );
  } catch (error) {
    return next(error);
  }
};
