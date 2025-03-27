const express = require('express');
const router = express.Router();
const { oauth, staticVar } = require('../lib/nsOAuth');
const { OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,CALLBACK_URL,ACCOUNT_ID,requestTokenUrl,accessTokenUrl,authorizeUrl} = staticVar


router.post('/send', async (req, res) => {
    //Access Tokens
    const ACCESS_TOKEN  = req.session.accessToken;
    const ACCESS_TOKEN_SECRET = req.session.accessTokenSecret;
    if (!ACCESS_TOKEN  || !ACCESS_TOKEN_SECRET) {
        return res.status(401).json({ error: 'User not authenticated with NetSuite' });
    }

    //Request Body payloads
    var refObj = req.body
    if (typeof refObj == 'string') {
        refObj = JSON.parse(refObj)
    }
    const SUITELET_URL = refObj['suitelet']
    refObj['tokenKey'] = ACCESS_TOKEN 
    refObj['tokenSecret'] = ACCESS_TOKEN_SECRET
    const payload = JSON.stringify(refObj);
    try {
        const response = await fetch(SUITELET_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: payload
        });
    
        const data = await response.text(); // or response.json() if JSON
        res.send(data);
    } 
    catch (err) {
        console.error('❌ NetSuite error:', err);
        res.status(500).json({ error: 'Suitelet call failed' });
    }
   
});


module.exports = router;