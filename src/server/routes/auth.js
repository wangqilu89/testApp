const express = require('express');
const OAuth = require('oauth').OAuth;
require('dotenv').config();

const router = express.Router();

const {
  OAUTH_CONSUMER_KEY,
  OAUTH_CONSUMER_SECRET,
  CALLBACK_URL,
  ACCOUNT_ID
} = process.env;

const requestTokenUrl = `https://${ACCOUNT_ID}.restlets.api.netsuite.com/rest/requesttoken`;
const accessTokenUrl = `https://${ACCOUNT_ID}.restlets.api.netsuite.com/rest/accesstoken`;
const authorizeUrl = `https://${ACCOUNT_ID}.app.netsuite.com/app/login/oauth2/authorize.nl`;

const oauth = new OAuth(
  requestTokenUrl,
  accessTokenUrl,
  OAUTH_CONSUMER_KEY,
  OAUTH_CONSUMER_SECRET,
  '1.0',
  CALLBACK_URL,
  'HMAC-SHA256'
);

// Step 1: Start OAuth
router.get('/start', (req, res) => {
  oauth.getOAuthRequestToken((err, token, tokenSecret) => {
    if (err) return res.status(500).json({ error: 'Token request failed', details: err });

    req.session = req.session || {};
    req.session.tokenSecret = tokenSecret;

    const redirectUrl = `${authorizeUrl}?oauth_token=${token}`;
    res.redirect(redirectUrl);
  });
});

// Step 2: Callback from NetSuite
router.get('/callback', (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const tokenSecret = req.session?.tokenSecret;

  oauth.getOAuthAccessToken(
    oauth_token,
    tokenSecret,
    oauth_verifier,
    (err, accessToken, accessTokenSecret) => {
      if (err) return res.status(500).json({ error: 'Access token failed', details: err });

      req.session.accessToken = accessToken;
      req.session.accessTokenSecret = accessTokenSecret;

      res.json({ message: 'OAuth success!', accessToken });
    }
  );
});

module.exports = router;