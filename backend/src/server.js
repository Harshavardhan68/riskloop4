/**
 * RiskLoop Backend Server
 * Multi-broker integration API server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import {
  authRoutes,
  brokersRoutes,
  accountRoutes,
  positionsRoutes,
  ordersRoutes,
  holdingsRoutes,
  quotesRoutes,
  tradesRoutes,
  devRoutes,
  websocketRoutes,
  commentsRoutes,
} from './routes/index.js';
import { db }                    from './services/DatabaseService.js';
import { tradeExecutionService } from './services/TradeExecutionService.js';
import { webSocketService }      from './services/WebSocketService.js';

// Load environment variables
dotenv.config();

// ── Database initialisation ───────────────────────────────────────────────────
// Must happen before any route handler runs so the tables exist.
db.initialize();

// Reload persisted trades into memory so duplicate-prevention works after restart
tradeExecutionService.loadFromDatabase();

// ── WebSocket event integration ───────────────────────────────────────────────
// Wire WebSocket executionUpdate events to TradeExecutionService
// This ensures broker-confirmed executions are automatically persisted as trades
webSocketService.on('executionUpdate', async (data) => {
  const { sessionId, brokerId, execution } = data;
  
  try {
    await tradeExecutionService.processExecution(brokerId, execution);
    console.log(`[WebSocket] Trade execution processed: ${execution.tradeId} (${brokerId})`);
  } catch (error) {
    console.error(`[WebSocket] Failed to process execution from ${brokerId}:`, error.message);
  }
});

// Log WebSocket connection events
webSocketService.on('connected', (data) => {
  console.log(`[WebSocket] ${data.brokerId} connected for session ${data.sessionId}`);
});

webSocketService.on('disconnected', (data) => {
  console.log(`[WebSocket] ${data.brokerId} disconnected for session ${data.sessionId}`);
});

webSocketService.on('error', (data) => {
  console.error(`[WebSocket] Error from ${data.brokerId}:`, data.error);
});

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================
// ROUTES
// ============================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RiskLoop Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API version 1 routes
app.use('/api/auth', authRoutes);
app.use('/api/brokers', brokersRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/websocket', websocketRoutes);
app.use('/api/market', commentsRoutes);

// Development routes (disabled in production)
app.use('/api/dev', devRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🛡️  RiskLoop Backend API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`  🚀 Server running on port ${PORT}`);
  console.log(`  🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`  🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  💾 Database: SQLite (node:sqlite) — data persists across restarts`);
  console.log('');
  console.log('  📍 API Endpoints:');
  console.log(`     • POST   /api/auth/connect`);
  console.log(`     • POST   /api/auth/disconnect`);
  console.log(`     • POST   /api/auth/sync`);
  console.log(`     • GET    /api/auth/status/:brokerId`);
  console.log(`     • GET    /api/brokers`);
  console.log(`     • GET    /api/account/profile?brokerId=<id>`);
  console.log(`     • GET    /api/account/funds?brokerId=<id>`);
  console.log(`     • GET    /api/positions?brokerId=<id>`);
  console.log(`     • GET    /api/orders?brokerId=<id>`);
  console.log(`     • POST   /api/orders?brokerId=<id>`);
  console.log(`     • PUT    /api/orders/:id?brokerId=<id>`);
  console.log(`     • DELETE /api/orders/:id?brokerId=<id>`);
  console.log(`     • GET    /api/holdings?brokerId=<id>`);
  console.log(`     • POST   /api/quotes?brokerId=<id>`);
  console.log(`     • GET    /api/trades?brokerId=<id>`);
  console.log(`     • GET    /api/market/comments?sort=<recent|liked>&page=<n>&limit=<n>`);
  console.log(`     • POST   /api/market/comments`);
  console.log(`     • PUT    /api/market/comments/:id`);
  console.log(`     • DELETE /api/market/comments/:id`);
  console.log(`     • POST   /api/market/comments/:id/like`);
  console.log(`     • POST   /api/market/comments/:id/dislike`);
  console.log(`     • POST   /api/market/comments/:id/reply`);
  console.log(`     • POST   /api/market/comments/:id/report`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[server] ${signal} received — closing database and exiting.`);
  db.close();
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
