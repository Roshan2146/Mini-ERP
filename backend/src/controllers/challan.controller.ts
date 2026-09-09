import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { Prisma, ChallanStatus, StockMovementType } from '@prisma/client';

/**
 * Generates an incrementing human-readable Challan number like CH-2025-0004
 */
async function generateNextChallanNumber(tx: Prisma.TransactionClient): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  const lastChallan = await tx.salesChallan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: { challanNumber: 'desc' },
  });

  let nextSeq = 1;
  if (lastChallan) {
    const parts = lastChallan.challanNumber.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSeq = parsedSeq + 1;
      }
    }
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as ChallanStatus;
    const customerId = req.query.customerId as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;
    const where: Prisma.SalesChallanWhereInput = {};

    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { customerName: { contains: search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [total, challans] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              businessName: true,
              mobileNumber: true,
              gstNumber: true,
              address: true,
            },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, productName: true, sku: true, currentStock: true },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return ApiResponse.paginated(
      res,
      challans,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'Challans retrieved successfully'
    );
  } catch (error) {
    return next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                sku: true,
                currentStock: true,
                minimumStock: true,
              },
            },
          },
        },
      },
    });

    if (!challan) {
      return next(AppError.notFound('Sales Challan not found'));
    }

    return ApiResponse.success(res, challan, 'Sales Challan retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * CREATE DRAFT CHALLAN
 * - Validates customer & products
 * - Takes snapshots of productName, sku, unitPrice
 * - Computes totalQuantity & totalAmount
 * - Does NOT reduce stock
 */
export const createChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, notes, items } = req.body;
    const userId = req.user!.id;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return next(AppError.notFound('Customer not found'));
    }

    // Fetch products to take snapshots and calculate prices
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return next(AppError.badRequest('One or more selected products do not exist'));
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItemsData = items.map((item: any) => {
      const prod = productMap.get(item.productId)!;
      const unitPrice = Number(prod.unitPrice);
      const qty = parseInt(item.quantity, 10);
      const itemTotal = unitPrice * qty;

      totalQuantity += qty;
      totalAmount += itemTotal;

      return {
        productId: prod.id,
        productNameSnapshot: prod.productName,
        skuSnapshot: prod.sku,
        unitPriceSnapshot: prod.unitPrice,
        quantity: qty,
        totalPrice: itemTotal,
      };
    });

    const newChallan = await prisma.$transaction(async (tx) => {
      const challanNumber = await generateNextChallanNumber(tx);

      return tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          totalAmount,
          status: ChallanStatus.DRAFT,
          notes,
          createdById: userId,
          items: {
            create: challanItemsData,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    return ApiResponse.success(res, newChallan, 'Draft Challan created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * UPDATE DRAFT CHALLAN
 */
export const updateChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { customerId, notes, items } = req.body;

    const existingChallan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingChallan) {
      return next(AppError.notFound('Sales Challan not found'));
    }

    if (existingChallan.status !== ChallanStatus.DRAFT) {
      return next(AppError.badRequest(`Cannot edit a challan with status '${existingChallan.status}'. Only DRAFT challans can be edited.`));
    }

    const updated = await prisma.$transaction(async (tx) => {
      let totalQuantity = existingChallan.totalQuantity;
      let totalAmount = existingChallan.totalAmount;

      if (items && items.length > 0) {
        // Delete old items
        await tx.salesChallanItem.deleteMany({ where: { challanId: id } });

        const productIds = items.map((i: any) => i.productId);
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });

        if (products.length !== productIds.length) {
          throw AppError.badRequest('One or more selected products do not exist');
        }

        const productMap = new Map(products.map((p) => [p.id, p]));
        totalQuantity = 0;
        let runningAmount = 0;

        const newItemsData = items.map((item: any) => {
          const prod = productMap.get(item.productId)!;
          const unitPrice = Number(prod.unitPrice);
          const qty = parseInt(item.quantity, 10);
          const itemTotal = unitPrice * qty;

          totalQuantity += qty;
          runningAmount += itemTotal;

          return {
            challanId: id,
            productId: prod.id,
            productNameSnapshot: prod.productName,
            skuSnapshot: prod.sku,
            unitPriceSnapshot: prod.unitPrice,
            quantity: qty,
            totalPrice: itemTotal,
          };
        });

        await tx.salesChallanItem.createMany({ data: newItemsData });
        totalAmount = runningAmount as any;
      }

      return tx.salesChallan.update({
        where: { id },
        data: {
          customerId: customerId ?? existingChallan.customerId,
          notes: notes !== undefined ? notes : existingChallan.notes,
          totalQuantity,
          totalAmount,
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    return ApiResponse.success(res, updated, 'Challan updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * CONFIRM CHALLAN (CRITICAL ATOMIC STOCK TRANSACTION)
 * 1. Fetch Challan & check status == DRAFT.
 * 2. In 1 single Transaction:
 *    - Check available stock for ALL products.
 *    - If ANY product has insufficient stock:
 *        -> THROW error & ROLL BACK transaction completely.
 *        -> NO stock is reduced.
 *    - If all items pass stock checks:
 *        -> Deduct stock for each product.
 *        -> Create OUT stock movement records.
 *        -> Mark Challan as CONFIRMED.
 */
export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw AppError.notFound('Sales Challan not found');
      }

      if (challan.status === ChallanStatus.CONFIRMED) {
        throw AppError.badRequest('This challan is already confirmed');
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw AppError.badRequest('Cannot confirm a cancelled challan');
      }

      if (challan.items.length === 0) {
        throw AppError.badRequest('Cannot confirm a challan with no line items');
      }

      // Step 1: Pre-fetch current stock for all items
      const productIds = challan.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Step 2: Validate stock sufficiency for EVERY item
      const insufficientStockErrors: string[] = [];
      for (const item of challan.items) {
        const prod = productMap.get(item.productId);
        if (!prod) {
          insufficientStockErrors.push(`Product '${item.productNameSnapshot}' not found in catalog.`);
          continue;
        }

        if (prod.currentStock < item.quantity) {
          insufficientStockErrors.push(
            `Insufficient stock for '${prod.productName}' (${prod.sku}). Required: ${item.quantity}, Available: ${prod.currentStock}`
          );
        }
      }

      if (insufficientStockErrors.length > 0) {
        throw AppError.badRequest(
          `Confirmation aborted: Stock validation failed. No stock was deducted. Details: ${insufficientStockErrors.join(' | ')}`
        );
      }

      // Step 3: All items are sufficient -> Deduct stock & create OUT movement records
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: StockMovementType.OUT,
            reason: `SALES_CHALLAN_${challan.challanNumber}`,
            referenceId: challan.id,
            createdById: userId,
          },
        });
      }

      // Step 4: Update status to CONFIRMED
      const confirmedChallan = await tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        include: {
          customer: true,
          items: true,
        },
      });

      return confirmedChallan;
    });

    return ApiResponse.success(
      res,
      result,
      `Challan ${result.challanNumber} confirmed successfully. Inventory has been updated.`
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * CANCEL CHALLAN
 * - If DRAFT: mark as CANCELLED directly.
 * - If CONFIRMED: safely restore/replenish stock and record IN stock movement.
 * - If CANCELLED: reject.
 */
export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw AppError.notFound('Sales Challan not found');
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw AppError.badRequest('This challan is already cancelled');
      }

      // If challan was CONFIRMED, safely replenish stock back into inventory
      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: StockMovementType.IN,
              reason: `CANCELLED_CHALLAN_RESTORE_${challan.challanNumber}`,
              referenceId: challan.id,
              createdById: userId,
            },
          });
        }
      }

      const cancelledChallan = await tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: {
          customer: true,
          items: true,
        },
      });

      return cancelledChallan;
    });

    return ApiResponse.success(
      res,
      result,
      `Challan ${result.challanNumber} cancelled successfully.${
        result.status === ChallanStatus.CANCELLED ? ' Any previously deducted stock has been restored.' : ''
      }`
    );
  } catch (error) {
    return next(error);
  }
};
