import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './utils/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`
  🚀 NexaCart API Server running in ${env.NODE_ENV} mode
  📡 Listening on: http://localhost:${env.PORT}
  🛒 Health Check: http://localhost:${env.PORT}/api/health
  `);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Closing HTTP server and disconnecting Prisma...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server and database connections closed gracefully.');
    process.exit(0);
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
