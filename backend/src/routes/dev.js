/**
 * Development Routes
 * Test endpoints for development only
 * REMOVE IN PRODUCTION
 */

import express from 'express';
import { brokerService } from '../services/BrokerService.js';

const router = express.Router();

// Disable in production
if (process.env.NODE_ENV === 'production') {
  router.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Development endpoints disabled in production',
    });
  });
} else {
  /**
   * POST /api/dev/angelone/test-connection
   * Test Angel One connection and fetch basic profile
   * 
   * Body: {
   *   clientId: string (optional, uses env if not provided),
   *   mpin: string (optional, uses env if not provided)
   * }
   */
  router.post('/angelone/test-connection', async (req, res) => {
    try {
      console.log('\n🧪 Testing Angel One Connection...\n');
      
      const { clientId, mpin } = req.body;
      
      // Create adapter instance
      const sessionId = 'dev-test-' + Date.now();
      const adapter = brokerService.getAdapter(sessionId, 'angelone');
      
      // Test connection
      console.log('1️⃣ Attempting authentication...');
      const connected = await adapter.connect({ clientId, mpin });
      
      if (!connected) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
        });
      }
      
      console.log('✅ Authentication successful\n');
      
      // Test profile fetch
      console.log('2️⃣ Fetching user profile...');
      const profile = await adapter.getProfile();
      console.log('✅ Profile fetched\n');
      
      // Test funds fetch
      console.log('3️⃣ Fetching funds...');
      const funds = await adapter.getFunds();
      console.log('✅ Funds fetched\n');
      
      // Disconnect
      console.log('4️⃣ Disconnecting...');
      await adapter.disconnect();
      console.log('✅ Disconnected\n');
      
      // Return sanitized results (no tokens)
      res.json({
        success: true,
        message: 'Angel One connection test successful',
        data: {
          connected: true,
          profile: {
            userId: profile.userId,
            name: profile.name,
            email: profile.email,
            exchanges: profile.exchanges,
            products: profile.products,
            // DO NOT SEND: tokens, raw credentials
          },
          funds: {
            availableMargin: funds.availableMargin,
            usedMargin: funds.usedMargin,
            totalMargin: funds.totalMargin,
          },
        },
      });
      
      // Cleanup
      brokerService.removeAdapter(sessionId, 'angelone');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message,
        hint: 'Check your environment variables in .env file',
      });
    }
  });

  /**
   * GET /api/dev/angelone/check-config
   * Check if Angel One environment variables are configured
   */
  router.get('/angelone/check-config', (req, res) => {
    const config = {
      apiKey: !!process.env.ANGELONE_API_KEY,
      clientId: !!process.env.ANGELONE_CLIENT_ID,
      mpin: !!process.env.ANGELONE_MPIN,
      totpSecret: !!process.env.ANGELONE_TOTP_SECRET,
    };
    
    const allConfigured = Object.values(config).every(v => v === true);
    
    res.json({
      success: true,
      configured: allConfigured,
      details: config,
      message: allConfigured 
        ? 'All Angel One environment variables are configured'
        : 'Some Angel One environment variables are missing',
    });
  });
}

export default router;
