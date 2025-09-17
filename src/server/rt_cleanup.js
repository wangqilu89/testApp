require('dotenv').config();
const { createClient } = require('redis');
const {DeleteUserProfile,keyRT }= require('./lib/jwtToken'); // adjust path if needed

(async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('REDIS_URL not set');
    process.exit(1);
  }

  const redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (e) => console.error('Redis error:', e));
  await redisClient.connect();
  

  let checked = 0, cleaned = 0;

  for await (const mapKey of redisClient.scanIterator({ MATCH: 'auth:rtmap:*', COUNT: 1000 })) {
    // mapKey format: auth:rtmap:<tenantId>:<userId>:<hash>
    // parse parts:
    
    const parts = mapKey.split(':'); // ['auth','rtmap',ten,user,hash]
    if (parts.length < 5) continue;
    const tenantId = parts[2];
    const userId = parts[3];
    const h = parts.slice(4).join(':'); // in case ':' appears (unlikely, but safe)

    checked += 1;

    // If corresponding refresh key no longer exists, cleanup
    const exists = await redisClient.exists(keyRT(h));
    console.log(mapKey,exists)
    if (!exists) {
      await DeleteUserProfile(redisClient,h);
     
      cleaned += 1;
    }
  }

  console.log(`RT cleanup done. Checked=${checked}, cleaned=${cleaned}`);
  await redisClient.quit();
  process.exit(0);
})();