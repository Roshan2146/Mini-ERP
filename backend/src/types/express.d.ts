import { Role } from '@prisma/client';

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
