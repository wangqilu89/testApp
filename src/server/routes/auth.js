const express = require('express');
const router = express.Router();
const { oauth, staticVar } = require('../lib/nsOAuth');
const { OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,CALLBACK_URL,ACCOUNT_ID,requestTokenUrl,accessTokenUrl,authorizeUrl,FRONT_END} = staticVar
const {  PostNS } = require('../lib/nsPost'); // 👈 Import it

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
  const platform = req.query.platform || 'web'; // default to web if not provided

  oauth.getOAuthAccessToken(
    oauth_token,
    tokenSecret,
    oauth_verifier,
    (err, accessToken, accessTokenSecret) => {
      if (err) return res.status(500).json({ error: 'Access token failed', details: err });

      req.session.accessToken = accessToken;
      req.session.accessTokenSecret = accessTokenSecret;
      if (platform === 'mobile') {
        
        // Deep link back to React Native app
        return res.redirect('myapp://auth/callback?success=true');
      } 
      else {
        
        var htmlStr = "<html>"
        htmlStr += "<body>"
        htmlStr += "<script>"
        htmlStr += " window.opener.postMessage('auth-success', '" + FRONT_END + "');"
        htmlStr += "window.close();"
        htmlStr += "</script>"
        htmlStr += "<p>Login successful. You can close this window.</p>"
        htmlStr += "</body>"
        htmlStr += "</html>"

        res.send(htmlStr);
      }
      //res.redirect('/dashboard');
    }
  );
});

router.get('/status', async (req, res) => {
  if (req.session.accessToken && req.session.accessTokenSecret) {
    req['body'] = {suitelet:'https://6134818.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=2720&deploy=1',command:'Get User'}
    await  PostNS(req,res)
  } else {
    res.json({id:0,role:0,group:0});
  }
});

router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ success: false, error: 'Failed to logout' });
      }
      res.clearCookie('connect.sid'); // ✅ Important to clear cookie on backend too
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});


module.exports = router;