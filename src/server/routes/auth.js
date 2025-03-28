const express = require('express');
const router = express.Router();
const { oauth, staticVar } = require('../lib/nsOAuth');
const { OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,CALLBACK_URL,ACCOUNT_ID,requestTokenUrl,accessTokenUrl,authorizeUrl} = staticVar


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
      res.redirect('http://localhost:8080/dashboard'); // or your React URL
      
      //res.redirect('/dashboard');
    }
  );
});

module.exports = router;