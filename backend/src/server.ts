import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import scoreRoutes from './routes/score.routes';
import drawRoutes from './routes/draw.routes';
import subscriptionRoutes from './routes/subscription.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Golf Lottery API is running 🚀' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
