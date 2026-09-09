import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`================================================`);
  logger.info(`🚀 Mini ERP + CRM Server running in [${env.NODE_ENV}] mode`);
  logger.info(`🌐 Listening on http://localhost:${env.PORT}`);
  logger.info(`🏥 Health check: http://localhost:${env.PORT}/api/health`);
  logger.info(`================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down immediately...', err);
  process.exit(1);
});

export default server;
