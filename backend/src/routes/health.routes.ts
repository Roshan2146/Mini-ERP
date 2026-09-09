import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Mini ERP + CRM Operations Portal API',
  }, 'System is online');
});

export default router;
