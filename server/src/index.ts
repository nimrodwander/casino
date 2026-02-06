import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import { sessionMiddleware } from './config/session.js';
import sessionRouter from './routes/session.js';

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
