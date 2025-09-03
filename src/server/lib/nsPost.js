const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const { staticVar } = require('../lib/nsOAuth');
const {SUITELET,OAUTH_CONSUMER_KEY,OAUTH_CONSUMER_SECRET,OAUTH_TOKEN_KEY,OAUTH_TOKEN_SECRET,ACCOUNT_ID} = staticVar

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
  let headers =  oauth.toHeader(oauth.authorize(request_data, token));
  headers.Authorization  += ', realm="' + ACCOUNT_ID + '"';
  headers['content-type'] = 'application/json';
  return headers
}


async function PostNS(req, res) {
  const account = req.query.acc || '0';
  let ACCESS_TOKEN = null
  let ACCESS_TOKEN_SECRET = null
  if (account == '1') {
    ACCESS_TOKEN = OAUTH_TOKEN_KEY;
    ACCESS_TOKEN_SECRET = OAUTH_TOKEN_SECRET;
  }
  else if (req.nsTokens?.tokenId && req.nsTokens?.tokenSecret) {
    ACCESS_TOKEN = req.nsTokens.tokenId;
    ACCESS_TOKEN_SECRET = req.nsTokens.tokenSecret;
  } 
  else {
    // fallback legacy session for handshake
    ACCESS_TOKEN = req.session?.accessToken;
    ACCESS_TOKEN_SECRET = req.session?.accessTokenSecret;
  }
  

  if (!ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    return res.status(401).json({ error: 'User not authenticated with NetSuite' });
  }

  try {
    let refObj = req.body;
    if (typeof refObj === 'string') {
      refObj = JSON.parse(refObj);
    }

    const finalWeb = refObj['restlet'] || SUITELET

    

    const oauthHeader = getOAuthHeader(
      finalWeb,
      'POST',
      ACCESS_TOKEN,
      ACCESS_TOKEN_SECRET,
      OAUTH_CONSUMER_KEY,
      OAUTH_CONSUMER_SECRET
    );

    //refObj['tokenKey'] = ACCESS_TOKEN;
    //refObj['tokenSecret'] = ACCESS_TOKEN_SECRET;

    const payload = JSON.stringify(refObj);
    
    const response = await fetch(finalWeb, {
      method: 'POST',
      headers: oauthHeader,
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