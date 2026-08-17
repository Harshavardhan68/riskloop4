/**
 * Economic Calendar Routes — MT5 / MQL5 Bridge Integration
 * POST /api/economic-calendar/mt5 — Ingest records from MT5 MQL5 bridge
 * GET  /api/economic-calendar     — Retrieve latest calendar events with filters
 */

import { Router } from 'express';
import { economicCalendarService } from '../services/economicCalendarService.js';

const router = Router();

/**
 * Middleware: Verify x-mt5-bridge-secret header
 */
function requireBridgeAuth(req, res, next) {
  const secretHeader = req.headers['x-mt5-bridge-secret'];

  if (!secretHeader) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing x-mt5-bridge-secret header in bridge request'
    });
  }

  if (!economicCalendarService.verifyBridgeSecret(secretHeader)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid MT5 bridge secret'
    });
  }

  next();
}

/**
 * POST /api/economic-calendar/mt5
 * Ingest economic calendar records from MT5 MQL5 Bridge
 */
router.post('/mt5', requireBridgeAuth, (req, res) => {
  try {
    const payload = req.body;

    if (!payload || (typeof payload !== 'object' && !Array.isArray(payload))) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Payload must be a valid JSON object or array of calendar events'
      });
    }

    const result = economicCalendarService.ingestMT5Records(payload);

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${result.count} calendar record(s) from MT5`,
      count: result.count,
      errorsCount: result.errorsCount,
      timestamp: new Date().toISOString(),
      data: result.records
    });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
});

/**
 * GET /api/economic-calendar
 * Retrieve latest economic calendar events with query filtering and chronological sorting
 */
router.get('/', (req, res) => {
  try {
    const { country, countryCode, currency, impact, from, to, limit } = req.query;

    const events = economicCalendarService.getCalendarEvents({
      country,
      countryCode,
      currency,
      impact,
      from,
      to,
      limit
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      filters: {
        country: country || countryCode || null,
        currency: currency || null,
        impact: impact || null,
        from: from || null,
        to: to || null
      },
      timestamp: new Date().toISOString(),
      events
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve economic calendar events'
    });
  }
});

export default router;
