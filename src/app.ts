import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import memberRoutes from './routes/member.routes';
import subscriptionRoutes from './routes/subscription.routes';
import workoutRoutes from './routes/workout.routes';
import bodyStatRoutes from './routes/bodyStats.routes';
import paymentRoutes from './routes/payment.routes';
import checkinRoutes from './routes/checkin.routes';
import analyticsRoutes from './routes/analytics.routes';
import exportRoutes from './routes/export.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
}));

// Rate limiting
app.use(rateLimiter);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', gym: 'Eagle Gym', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/body-stats', bodyStatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exports', exportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
