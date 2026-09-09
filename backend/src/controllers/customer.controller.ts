import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { Prisma } from '@prisma/client';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const customerType = req.query.customerType as any;
    const status = req.query.status as any;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (status) {
      where.status = status;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              challans: true,
              followUps: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return ApiResponse.paginated(
      res,
      customers,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'Customers retrieved successfully'
    );
  } catch (error) {
    return next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      return next(AppError.notFound('Customer not found with the specified ID'));
    }

    return ApiResponse.success(res, customer, 'Customer details fetched successfully');
  } catch (error) {
    return next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body,
    });

    return ApiResponse.success(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const exists = await prisma.customer.findUnique({ where: { id } });
    if (!exists) {
      return next(AppError.notFound('Customer not found'));
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: req.body,
    });

    return ApiResponse.success(res, updated, 'Customer updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { challans: true },
        },
      },
    });

    if (!customer) {
      return next(AppError.notFound('Customer not found'));
    }

    if (customer._count.challans > 0) {
      // If customer has linked challans, deactivate instead of hard delete to preserve audit history
      const deactivated = await prisma.customer.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return ApiResponse.success(
        res,
        deactivated,
        'Customer has linked challans. Status changed to INACTIVE instead of permanent deletion.'
      );
    }

    await prisma.customer.delete({ where: { id } });

    return ApiResponse.success(res, null, 'Customer deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export const addFollowUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: customerId } = req.params;
    const { notes, followUpDate, status } = req.body;
    const userId = req.user!.id;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return next(AppError.notFound('Customer not found'));
    }

    // Create follow-up and update customer's next followUpDate in transaction
    const [followUp] = await prisma.$transaction([
      prisma.followUp.create({
        data: {
          customerId,
          notes,
          followUpDate: new Date(followUpDate),
          status: status || 'PENDING',
          createdById: userId,
        },
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: {
          followUpDate: new Date(followUpDate),
        },
      }),
    ]);

    return ApiResponse.success(res, followUp, 'Follow-up note added successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const getCustomerFollowUps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: customerId } = req.params;

    const followUps = await prisma.followUp.findMany({
      where: { customerId },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, followUps, 'Customer follow-up timeline retrieved');
  } catch (error) {
    return next(error);
  }
};

export const getAllFollowUps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as any;
    const where: Prisma.FollowUpWhereInput = {};

    if (status) {
      where.status = status;
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        customer: {
          select: { id: true, customerName: true, businessName: true, mobileNumber: true, status: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { followUpDate: 'asc' },
    });

    return ApiResponse.success(res, followUps, 'All CRM follow-ups retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
