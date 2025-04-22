const express = require('express');
const router = express.Router();
const { oauth, staticVar } = require('../lib/nsOAuth');
const { OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,CALLBACK_URL,ACCOUNT_ID,requestTokenUrl,accessTokenUrl,authorizeUrl,FRONT_END} = staticVar
const {  PostNS } = require('../lib/nsPost'); // 👈 Import it

router.post('/send', async (req, res) => {
    //Access Tokens
    
    try {
        await PostNS(req,res)
    } 
    catch (err) {
        console.error('❌ NetSuite error:', err);
        res.status(500).json({ error: 'Suitelet call failed' });
    }
   
});


module.exports = router;