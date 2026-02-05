import express from 'express';
import cors from 'cors';
import sessionRouter from './routes/session.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/session', sessionRouter);

app.listen(PORT, () => {
  console.log(`Casino server running on http://localhost:${PORT}`);
});

export { app };
