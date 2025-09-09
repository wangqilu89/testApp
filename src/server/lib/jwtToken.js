// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {  PostNS } = require('./nsPost'); // 👈 Import it

// ----------------- Helpers & constants -----------------
const ACCESS_TTL_S = 10 * 60;              // 10 minutes
const REFRESH_TTL_S = 30 * 24 * 3600;      // 30 days
const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'dev_access_secret';
const PROFILE_TTL_S = 300; // 5 minutes

// Redis keys
const keyRT = (h) => `auth:rt:${h}`;                           // refresh allowlist
const keyNS = (tenant, userId) => `ns:tba:${tenant}:${userId}`; // NetSuite TBA per tenant+user
const keyLoginCode = (code) => `auth:code:${code}`;            // mobile one-time code
const keyUserProfile = (tenantId, userId) => `user:profile:${tenantId}:${userId}`;

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const newOpaque = () => crypto.randomBytes(48).toString('base64url');

// Your app’s JWT claims encoder
const issueAccessToken = (user) => {
  // user: { id, tenantId, scopes? }
  const payload = {
    sub: String(user.id),
    ten: String(user.tenantId || 0),
    scp: user.scopes || [],
  };
  return jwt.sign(
    payload,
    ACCESS_JWT_SECRET,
    {
      expiresIn: ACCESS_TTL_S,
      issuer: 'your-middleware',
      audience: 'your-frontend',
      jwtid: crypto.randomUUID(),
    }
  );

  
  
};

const AuthTokenLib = ({redisClient}) => {
  return async function AuthToken(req,res,next) {
    try {
      // 1) Verify access token
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
      if (!token) return res.status(401).json({ error: 'Missing access token' });

      let payload;
      try {
        payload = jwt.verify(token, ACCESS_JWT_SECRET, {
          audience: process.env.ACCESS_JWT_AUD || 'your-frontend',
          issuer: process.env.ACCESS_JWT_ISS || 'your-middleware',
        });
      } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired access token' });
      }

      // 2) Load NetSuite TBA tokens from Redis
      const nsKey = keyNS(String(payload.ten || '0'), String(payload.sub));
      const nsTokens = await redisClient.hGetAll(nsKey);

      if (!nsTokens || !nsTokens.tokenId || !nsTokens.tokenSecret) {
        return res.status(401).json({ error: 'NetSuite tokens not found for user' });
      }

      // 3) Attach to req for PostNS + keep payload for downstream use
      req.auth = payload; // { sub, ten, scp, ... }
      req.nsTokens = {
        tokenId: nsTokens.tokenId,
        tokenSecret: nsTokens.tokenSecret,
      };

      return next();
    } 
    catch (err) {
      console.error('Auth/NS middleware error:', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

}

const NSUserProfile = async ({nsTokens}) => {
  const req = {
    body: {
      restlet: 'https://6134818.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=3356&deploy=1',
      command: 'App : Get User',
    },
    nsTokens, // { tokenId, tokenSecret }
    query: {},
    session: {},
  };
  const data = await new Promise((resolve, reject) => {
    const res = {
      json: (obj) => resolve(obj),
      send: (obj) => resolve(obj),
      status: (code) => ({
        json: (o) => (code >= 400 ? reject(o) : resolve(o)),
        send: (o) => (code >= 400 ? reject(o) : resolve(o)),
      }),
    };
    PostNS(req, res).catch(reject);
  });
  if (data && data.success && data.success.data) {
    return data.success.data; // your full nsUser
  }
  return null;
}

const GetUserProfile = async (redisClient, tenantId, userId) => {
  const cached = await redisClient.get(keyUserProfile(tenantId, userId));
  return cached ? JSON.parse(cached) : null;
}

const SetUserProfile = async (redisClient, tenantId, userId, nsUser) => {
  // Optionally normalize/augment
  const fullUser = {
    ...nsUser,
    id: Number(nsUser.id ?? userId),
    tenantId: Number(nsUser.tenantId ?? tenantId),
    _meta: { cachedAt: Date.now() },
  };
  await redisClient.setEx(keyUserProfile(tenantId, userId), PROFILE_TTL_S, JSON.stringify(fullUser));
  return fullUser;
}

module.exports = {
    issueAccessToken,
    ACCESS_JWT_SECRET, 
    REFRESH_TTL_S, 
    sha256, 
    newOpaque, 
    keyRT, 
    keyNS,
    keyLoginCode ,
    AuthTokenLib,
    NSUserProfile,
    GetUserProfile,
    SetUserProfile
}