const express = require('express');
const router = express.Router();
const { oauth, staticVar } = require('../lib/nsOAuth');
const { OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,CALLBACK_URL,ACCOUNT_ID,requestTokenUrl,accessTokenUrl,authorizeUrl} = staticVar


router.post('/send', (req, res) => {
    var refObj = req.body
    if (typeof refObj == 'string') {
        refObj = JSON.parse(refObj)
    }
    const RESTLET_URL = refObj['restlet']
    const payload = JSON.stringify(refObj);
    const ACCESS_TOKEN  = req.session.accessToken;
    const ACCESS_TOKEN_SECRET = req.session.accessTokenSecret;

  if (!accessToken || !accessTokenSecret) {
    return res.status(401).json({ error: 'User not authenticated with NetSuite' });
  }
  oauth.post(
    RESTLET_URL,
    ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET,
    payload,
    'application/json',
    (err, data, response) => {
      if (err) {
        console.error('❌ NetSuite error:', err);
        return res.status(500).json({ error: err });
      }

      res.json({ message: '✅ NetSuite response:', data });
    }
  );
});


module.exports = router;