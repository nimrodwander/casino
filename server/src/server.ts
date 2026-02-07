import 'dotenv/config';
import 'reflect-metadata';
import { App } from './app.js';
import { config } from './config.js';
import { databaseService } from './services/database.service.js';

databaseService.initialize().then(() => {
  console.log('Database initialized');
  const server = new App();
  server.start(config.port);
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
