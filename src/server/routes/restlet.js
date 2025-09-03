const express = require('express');
const {  PostNS } = require('../lib/nsPost'); // 👈 Import it
const { AuthTokenLib } = require('../lib/jwtToken');

module.exports = function restletFactory({ redisClient }) {
    const router = express.Router();
    const requireAuthAndNsTokens = AuthTokenLib({ redisClient });
  
    // Protect all NetSuite routes with JWT + TBA lookup
    router.post('/send', requireAuthAndNsTokens, async (req, res) => {
      try {
        await PostNS(req, res); // PostNS will use req.nsTokens
      } catch (err) {
        console.error('❌ NetSuite error:', err);
        res.status(500).json({ error: 'Suitelet call failed' });
      }
    });
  
    return router;
};
