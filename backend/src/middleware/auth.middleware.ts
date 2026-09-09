import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { Role } from '@prisma/client';
import { AppError } from '../utils/appError';
import { env } from '../config/env';
import prisma from '../config/prisma';

interface DecodedToken {
  id: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token missing. Please log in.'));
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    // Check if user still exists in database and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return next(AppError.unauthorized('The user belonging to this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(AppError.forbidden('Your account has been deactivated. Please contact an administrator.'));
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    // ADMIN always has full system bypass
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Forbidden: Role '${req.user.role}' does not have permission to access this resource`
        )
      );
    }

    return next();
  };
};
