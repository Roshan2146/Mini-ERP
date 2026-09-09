import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ChallanStatus, CustomerStatus, FollowUpStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Run parallel aggregate queries for high performance
    const [
      totalCustomers,
      activeCustomers,
      leadCustomers,
      inactiveCustomers,
      allProducts,
      draftChallansCount,
      confirmedChallansCount,
      cancelledChallansCount,
      todayFollowUpsCount,
      recentChallans,
      recentMovements,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.customer.count({ where: { status: CustomerStatus.LEAD } }),
      prisma.customer.count({ where: { status: CustomerStatus.INACTIVE } }),
      prisma.product.findMany({
        select: {
          id: true,
          productName: true,
          sku: true,
          category: true,
          unitPrice: true,
          currentStock: true,
          minimumStock: true,
        },
      }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.CANCELLED } }),
      prisma.followUp.count({
        where: {
          status: FollowUpStatus.PENDING,
          followUpDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { customerName: true, businessName: true },
          },
        },
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { productName: true, sku: true },
          },
          createdBy: {
            select: { fullName: true },
          },
        },
      }),
      prisma.followUp.findMany({
        where: { status: FollowUpStatus.PENDING },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        include: {
          customer: {
            select: { customerName: true, mobileNumber: true },
          },
        },
      }),
    ]);

    // Product & Inventory calculations
    const totalProducts = allProducts.length;
    const totalInventoryQuantity = allProducts.reduce((acc, p) => acc + p.currentStock, 0);
    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
    const inventoryValuation = allProducts.reduce(
      (acc, p) => acc + p.currentStock * Number(p.unitPrice),
      0
    );

    // Chart Data 1: Inventory by Category
    const categoryMap: { [key: string]: { count: number; totalStock: number } } = {};
    for (const prod of allProducts) {
      if (!categoryMap[prod.category]) {
        categoryMap[prod.category] = { count: 0, totalStock: 0 };
      }
      categoryMap[prod.category].count += 1;
      categoryMap[prod.category].totalStock += prod.currentStock;
    }
    const inventoryByCategory = Object.entries(categoryMap).map(([category, val]) => ({
      category,
      count: val.count,
      totalStock: val.totalStock,
    }));

    // Chart Data 2: Customer Status Distribution
    const customerStatusDistribution = [
      { name: 'Active', value: activeCustomers, color: '#10B981' },
      { name: 'Leads', value: leadCustomers, color: '#3B82F6' },
      { name: 'Inactive', value: inactiveCustomers, color: '#9CA3AF' },
    ];

    // Chart Data 3: Low Stock Highlights (Top 6 critically low)
    const lowStockList = lowStockProducts
      .sort((a, b) => a.currentStock - b.minimumStock - (b.currentStock - b.minimumStock))
      .slice(0, 6)
      .map((p) => ({
        name: p.productName.length > 18 ? p.productName.substring(0, 18) + '...' : p.productName,
        currentStock: p.currentStock,
        minimumStock: p.minimumStock,
        sku: p.sku,
      }));

    // Chart Data 4: Challan Status Trends
    const challanDistribution = [
      { name: 'Confirmed', count: confirmedChallansCount, color: '#10B981' },
      { name: 'Draft', count: draftChallansCount, color: '#F59E0B' },
      { name: 'Cancelled', count: cancelledChallansCount, color: '#EF4444' },
    ];

    return ApiResponse.success(
      res,
      {
        userRole,
        summary: {
          totalCustomers,
          activeCustomers,
          leadCustomers,
          totalProducts,
          totalInventoryQuantity,
          lowStockCount: lowStockProducts.length,
          draftChallansCount,
          confirmedChallansCount,
          cancelledChallansCount,
          todayFollowUpsCount,
          inventoryValuation,
        },
        charts: {
          inventoryByCategory,
          customerStatusDistribution,
          lowStockList,
          challanDistribution,
        },
        recent: {
          challans: recentChallans,
          movements: recentMovements,
          followUps: upcomingFollowUps,
          lowStockAlerts: lowStockProducts.slice(0, 5),
        },
      },
      'Dashboard overview retrieved successfully'
    );
  } catch (error) {
    return next(error);
  }
};
