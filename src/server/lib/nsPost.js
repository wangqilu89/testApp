

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

    const SUITELET_URL = refObj['suitelet'];

    if (!SUITELET_URL) {
      return res.status(400).json({ error: 'Suitelet URL is missing in request.' });
    }

    refObj['tokenKey'] = ACCESS_TOKEN;
    refObj['tokenSecret'] = ACCESS_TOKEN_SECRET;

    const payload = JSON.stringify(refObj);

    const response = await fetch(SUITELET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    const data = await response.text(); // or you can use .json() if you expect JSON always
    return res.send(data);
  } catch (err) {
    console.error('❌ NetSuite error:', err);
    return res.status(500).json({ error: 'Suitelet call failed', details: err.message });
  }
}

module.exports = {
    PostNS
};