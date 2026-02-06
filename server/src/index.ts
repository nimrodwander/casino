import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import 'reflect-metadata';
import { sessionMiddleware } from './config/session.config.js';
import sessionRouter from './routers/session.router.js';
import { initializeDatabase } from './services/database.service.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/session', sessionRouter);

async function startServer() {
  await initializeDatabase();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Casino server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
