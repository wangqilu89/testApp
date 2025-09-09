const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { oauth, staticVar } = require('../lib/nsOAuth');
const {  issueAccessToken,ACCESS_JWT_SECRET, REFRESH_TTL_S, sha256, newOpaque, keyRT, keyNS,keyLoginCode   } = require('../lib/jwtToken');
const {  GetUserProfile,SetUserProfile,NSUserProfile,keyUserProfile  } = require('../lib/jwtToken');
const { MIDDLEWARE_URL,authorizeUrl} = staticVar
const {  PostNS } = require('../lib/nsPost'); // 👈 Import it


const nullValidation = (value) => {
  if (value == null || value == 'NaN' || value == '' || value == undefined || value == '&nbsp;') {
    return true;
  } else {
    return false;
  }
} 

module.exports = function authRoutesFactory({ redisClient }) {

  const router = express.Router();
  // Step 1: Start OAuth
  router.get('/start', (req, res) => {
    const { origin,platform} = req.query; 
    
    oauth.getOAuthRequestToken((err, token, tokenSecret) => {
      if (err) return res.status(500).json({ error: 'Token request failed', details: err });
      
      req.session = req.session || {};
      req.session.tokenSecret = tokenSecret;
      req.session.origin = origin || MIDDLEWARE_URL
      req.session.platform = platform || 'web'

      const redirectUrl = `${authorizeUrl}?oauth_token=${token}`;
      res.redirect(redirectUrl);
      
    });
  });

  // Step 2: Callback from NetSuite
  router.get('/callback', (req, res) => {
    try {
    const { oauth_token, oauth_verifier } = req.query;
    const tokenSecret = req.session?.tokenSecret;
    const platform = (!nullValidation(req.query.platform)? req.query.platform:(!nullValidation(req.session?.platform) ? req.session.platform : 'web'));// default to web if not provided
    const origin = (!nullValidation(req.session?.origin)?req.session.origin:MIDDLEWARE_URL);

    oauth.getOAuthAccessToken(
      oauth_token,
      tokenSecret,
      oauth_verifier,
      async (err, accessToken, accessTokenSecret) => {
        if (err) {
          console.error('OAuth access token error', err);
          return res.status(500).json({ error: 'Access token failed', details: err });
        }
        
        // TEMP: put tokens in session so PostNS can run once
        req.nsTokens = {tokenId:accessToken.trim(),tokenSecret:accessTokenSecret.trim()}
        
        // 1) Get NS user once (uses req.nsTokens)
        const nsUser = await NSUserProfile(req);
       
        if (!nsUser || !nsUser.id) {
          return res.status(401).json({ error: 'Unable to identify user from NetSuite' });
        }
       //console.log('User Info',nsUser)
        // 2) Persist TBA in Redis (server-only)
        const tenantId = String(nsUser.tenantId || 0);
        const userId = String(nsUser.id);
        const nsKey = keyNS(tenantId, userId);
        //console.log('Going to hSet')
        await redisClient.hSet(nsKey, {
          tokenId: req.nsTokens.tokenId,
          tokenSecret: req.nsTokens.tokenSecret,
        });
        //console.log('Complete hSet')
        // 3) Cache the **full** profile in Redis (short TTL)
        await SetUserProfile(redisClient, tenantId, userId, nsUser);

        // 4) Issue JWT + refresh
        const accessTokenJWT = issueAccessToken({ id: userId, tenantId });
        const refreshToken = newOpaque();
        const refreshHash = sha256(refreshToken);
        
        await redisClient.setEx(
            keyRT(refreshHash),
            REFRESH_TTL_S,
            JSON.stringify({ userId,tenantId })
        );

        // 6) One-time code payload for app/web exchange (include full user here)
        const code = crypto.randomBytes(24).toString('base64url');
        await redisClient.setEx(
          keyLoginCode(code),
          180, // 3 minutes
          JSON.stringify({
            accessToken: accessTokenJWT,
            refreshToken,
            user: {...nsUser},
          })
        );

        // 7) Redirect with ?code=...
        if (platform === 'mobile') {
          return res.redirect(`myapp://?code=${encodeURIComponent(code)}`);
        }
        else {
          return res.redirect(`${origin}/?code=${encodeURIComponent(code)}`);
        }
      }
    );
    }
    catch (e) {
      console.error('Callback error:', e);
      return res.status(500).json({ error: 'Callback failed' });
    }
  });

  // 3) Mobile one-time code exchange -> returns tokens once
  //    POST /auth/exchange { code }
  router.post('/exchange', async (req, res) => {
    const { code } = req.body || {};
   
    if (!code) return res.status(400).json({ error: 'Missing code' });
    const data = await redisClient.getDel(keyLoginCode(code)); // get & delete

    if (!data) return res.status(410).json({ error: 'Code expired or invalid' });
    const parsed = JSON.parse(data);
    return res.json(parsed);
  });

  router.post('/refresh', async (req, res) => {
    try {
      const isNative = !!req.header('x-platform-native');
      const rt = isNative ? req.body?.refreshToken : req.cookies?.rt;
      if (!rt) return res.status(401).json({ error: 'Missing refresh token' });

      const h = sha256(rt);
      const stored = await redisClient.get(keyRT(h));
      if (!stored) return res.status(401).json({ error: 'Invalid refresh' });

      const payload = JSON.parse(stored);

      // Rotate refresh
      await redisClient.del(keyRT(h));
      const newRT = newOpaque();
      const newHash = sha256(newRT);
      await redisClient.setEx(keyRT(newHash), REFRESH_TTL_S, JSON.stringify(payload));

      // New access
      const newAccess = issueAccessToken({ id: payload.userId, tenantId: payload.tenantId });

      if (isNative) {
        return res.json({ accessToken: newAccess, refreshToken: newRT });
      } else {
        res.cookie('rt', newRT, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/auth',
          maxAge: REFRESH_TTL_S * 1000,
        });
        return res.json({ accessToken: newAccess });
      }
    } catch (e) {
      console.error('Refresh error:', e);
      return res.status(500).json({ error: 'Refresh failed' });
    }
  });

  // 5) Logout: revoke refresh, clear cookie (web)
  router.post('/logout', async (req, res) => {
    try {
      const isNative = !!req.header('x-platform-native');
      const rt = isNative ? req.body?.refreshToken : req.cookies?.rt;

      if (rt) {
        const h = sha256(rt);
        const stored = await redisClient.get(keyRT(h));
       
        await redisClient.del(keyRT(h));
        if (stored) {
          const { userId, tenantId } = JSON.parse(stored);
          await redisClient.del(keyUserProfile(tenantId, userId)); // optional
        }
      }
      // Clear cookie for web
      res.clearCookie('rt', { path: '/auth', httpOnly: true, sameSite: 'none', secure: process.env.NODE_ENV === 'production' });

      return res.json({ success: true });
    } catch (e) {
      console.error('Logout error:', e);
      return res.status(500).json({ success: false });
    }
  });

  // 6) Status: verify Authorization bearer; (optionally) call NS using stored TBA
  //    Here we just return basic identity. If you need NS data, you can look up TBA by (ten,userId).
  router.post('/status', async (req, res) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
      if (!token) return res.json({ id: 0, role: 0, group: 0 });

      const payload = jwt.verify(token, ACCESS_JWT_SECRET, {
        audience: 'your-frontend',
        issuer: 'your-middleware',
      });

      const userId = String(payload.sub);
      const tenantId = String(payload.ten || '0');

      // 1) Try cached profile
      const cached = await GetUserProfile(redisClient, tenantId, userId);
      if (cached) return res.json(cached);

      // 2) Load TBA tokens and fetch once from NetSuite
      const nsTokens = await redisClient.hGetAll(keyNS(tenantId, userId));
      if (!nsTokens || !nsTokens.tokenId || !nsTokens.tokenSecret) {
        // fallback to JWT identity if we can't fetch profile
        return res.json({
          id: Number(userId),
          tenantId: Number(tenantId),
          role: payload.scp || [],
        });
      }
      
      //Modify req
      req.nsTokens = { tokenId: nsTokens.tokenId, tokenSecret: nsTokens.tokenSecret }
      const nsUser = await NSUserProfile(req);
      
      if (!nsUser || !nsUser.id) {
        return res.json({
          id: Number(userId),
          tenantId: Number(tenantId),
          role: payload.scp || [],
        });
      }

      const fullUser = await SetUserProfile(redisClient, tenantId, userId, nsUser);
      return res.json(fullUser);
      
    } 
    catch (e) {
      // Any failure -> not logged in
      return res.json({ id: 0, role: 0, group: 0 });
    }
  });


  return router;
}
