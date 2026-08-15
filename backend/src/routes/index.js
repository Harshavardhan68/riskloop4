/**
 * Routes Index
 * Export all API routes
 */

import authRoutes from './auth.js';
import brokersRoutes from './brokers.js';
import accountRoutes from './account.js';
import positionsRoutes from './positions.js';
import ordersRoutes from './orders.js';
import holdingsRoutes from './holdings.js';
import quotesRoutes from './quotes.js';
import tradesRoutes from './trades.js';
import devRoutes from './dev.js';
import websocketRoutes from './websocket.js';
import commentsRoutes from './comments.js';

export {
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
};
