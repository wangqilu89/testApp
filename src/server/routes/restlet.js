const express = require('express');
const router = express.Router();
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