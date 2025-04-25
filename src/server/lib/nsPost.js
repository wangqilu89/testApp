const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const { staticVar } = require('../lib/nsOAuth');
const {SUITELET,OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET} = staticVar

function getOAuthHeader(url, method, tokenKey, tokenSecret, consumerKey, consumerSecret) {
  const oauth = OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerSecret
    },
    signature_method: 'HMAC-SHA256',
    hash_function(baseString, key) {
      return crypto.createHmac('sha256', key).update(baseString).digest('base64');
    }
  });

  const request_data = { url, method };
  const token = { key: tokenKey, secret: tokenSecret };
  return oauth.toHeader(oauth.authorize(request_data, token));
}


async function PostNS(req, res) {
  const ACCESS_TOKEN = req.session.accessToken;
  const ACCESS_TOKEN_SECRET = req.session.accessTokenSecret;

  if (!ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    return res.status(401).json({ error: 'User not authenticated with NetSuite' });
  }

  try {
    let refObj = req.body;
    if (typeof refObj === 'string') {
      refObj = JSON.parse(refObj);
    }

    const oauthHeader = getOAuthHeader(
      SUITELET,
      'POST',
      ACCESS_TOKEN,
      ACCESS_TOKEN_SECRET,
      OAUTH_CONSUMER_KEY,
      OAUTH_CONSUMER_SECRET
    );

    refObj['tokenKey'] = ACCESS_TOKEN;
    refObj['tokenSecret'] = ACCESS_TOKEN_SECRET;

    const payload = JSON.stringify(refObj);
    

    const response = await fetch(SUITELET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','User-Agent' : 'Mozilla/5.0',...oauthHeader},
      body: payload,
    });

    const data = await response.json(); // or you can use .json() if you expect JSON always
    return res.send(data);
  } catch (err) {
    console.error('❌ NetSuite error:', err);
    return res.status(500).json({ error: 'Suitelet call failed', details: err.message });
  }
}

module.exports = {
    PostNS
};