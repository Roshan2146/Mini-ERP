import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { Prisma } from '@prisma/client';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const lowStockOnly = req.query.lowStockOnly === 'true' || (req.query.lowStockOnly as any) === true;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Handle low stock condition if requested
    // Note: in Prisma without raw query, currentStock <= minimumStock
    let products: any[];
    let total: number;

    if (lowStockOnly) {
      // Find where currentStock <= minimumStock
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
      });

      const filtered = allProducts.filter((p) => p.currentStock <= p.minimumStock);
      total = filtered.length;
      products = filtered.slice(skip, skip + limit);
    } else {
      [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
      ]);
    }

    const totalPages = Math.ceil(total / limit) || 1;

    // Attach isLowStock flag
    const productsWithMeta = products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minimumStock,
    }));

    return ApiResponse.paginated(
      res,
      productsWithMeta,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'Products retrieved successfully'
    );
  } catch (error) {
    return next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!product) {
      return next(AppError.notFound('Product not found'));
    }

    const isLowStock = product.currentStock <= product.minimumStock;

    return ApiResponse.success(
      res,
      { ...product, isLowStock },
      'Product details fetched successfully'
    );
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productName, sku, category, unitPrice, currentStock = 0, minimumStock = 5, warehouseLocation } = req.body;

    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.toUpperCase() },
    });

    if (existingSku) {
      return next(AppError.conflict(`A product with SKU '${sku}' already exists`));
    }

    // Create product and initial stock movement inside transaction if currentStock > 0
    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          productName,
          sku: sku.toUpperCase(),
          category,
          unitPrice,
          currentStock,
          minimumStock,
          warehouseLocation,
        },
      });

      if (currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            quantity: currentStock,
            movementType: 'IN',
            reason: 'INITIAL_STOCK_CREATION',
            createdById: req.user?.id,
          },
        });
      }

      return prod;
    });

    return ApiResponse.success(res, newProduct, 'Product created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { productName, sku, category, unitPrice, minimumStock, warehouseLocation } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return next(AppError.notFound('Product not found'));
    }

    if (sku && sku.toUpperCase() !== existing.sku) {
      const duplicate = await prisma.product.findUnique({
        where: { sku: sku.toUpperCase() },
      });
      if (duplicate) {
        return next(AppError.conflict(`Product with SKU '${sku}' already exists`));
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        productName: productName ?? existing.productName,
        sku: sku ? sku.toUpperCase() : existing.sku,
        category: category ?? existing.category,
        unitPrice: unitPrice ?? existing.unitPrice,
        minimumStock: minimumStock ?? existing.minimumStock,
        warehouseLocation: warehouseLocation ?? existing.warehouseLocation,
      },
    });

    return ApiResponse.success(res, updated, 'Product updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { challanItems: true, stockMovements: true },
        },
      },
    });

    if (!product) {
      return next(AppError.notFound('Product not found'));
    }

    if (product._count.challanItems > 0) {
      return next(
        AppError.badRequest(
          'Cannot delete product as it is referenced in sales challans. Consider adjusting stock to 0 instead.'
        )
      );
    }

    await prisma.$transaction([
      prisma.stockMovement.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return ApiResponse.success(res, null, 'Product deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return ApiResponse.success(
      res,
      categories.map((c) => c.category),
      'Product categories retrieved'
    );
  } catch (error) {
    return next(error);
  }
};
