const express = require('express');
const router = express.Router();
const { oauth, staticVar } = require('../lib/nsOAuth');
const { MIDDLEWARE_URL,authorizeUrl} = staticVar
const {  PostNS } = require('../lib/nsPost'); // 👈 Import it

const nullValidation = (value) => {
    if (value == null || value == 'NaN' || value == '' || value == undefined || value == '&nbsp;') {
		  return true;
		} else {
		  return false;
		}
}

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
    //res.json({success:{data:{url:redirectUrl,account:ACCOUNT_ID}}}); 
  });
});

// Step 2: Callback from NetSuite
router.get('/callback', (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const tokenSecret = req.session?.tokenSecret;
  const platform = (!nullValidation(req.query.platform)? req.query.platform:(!nullValidation(req.session?.platform) ? req.session.platform : 'web'));// default to web if not provided
  const origin = (!nullValidation(req.session?.origin)?req.session.origin:MIDDLEWARE_URL);

  oauth.getOAuthAccessToken(
    oauth_token,
    tokenSecret,
    oauth_verifier,
    (err, accessToken, accessTokenSecret) => {
      if (err) return res.status(500).json({ error: 'Access token failed', details: err });

      req.session.accessToken = accessToken.trim();
      req.session.accessTokenSecret = accessTokenSecret.trim();
      if (platform === 'mobile') {
        
        // Deep link back to React Native app
        return res.redirect('myapp://auth/callback?success=true');
      } 
      else {
        res.redirect(`${origin}/home`);
        
      }
      
    }
  );
});

const handleStatusCheck = async (req, res) => {
  if (req.session.accessToken && req.session.accessTokenSecret) {
    req.body = {
      restlet: 'https://6134818.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=3356&deploy=1',
      command: 'Get User',
    };
    await PostNS(req, res);
  } else {
    res.json({ id: 0, role: 0, group: 0 });
  }
};


router.get('/status', handleStatusCheck);

router.post('/status', handleStatusCheck);

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