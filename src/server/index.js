// import './server.mock';

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // ← add this at the top

const {RedisStore} = require("connect-redis")
const {createClient} = require("redis")

const cors = require('cors'); 
const path = require('path');
const restletRoutes = require('./routes/restlet');
const authRoutes = require('./routes/auth');
const {FRONT_END} = require('./lib/nsOAuth').staticVar;




const app = express();
const PORT = 5000;
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// Cookies
app.use(cookieParser());

//Start Test Environment
/*
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
  secret: 'netsuite-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true
  },
  name: 'connect.sid' // Ensure the cookie name is explicitly set
}));
app.use(cors({origin:FRONT_END,credentials: true}));

//End Test Environment
*/

//Start Actual Environment
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

// CORS
// IMPORTANT: FRONT_END should be exact origin (no trailing slash). If you have multiple,
// pass an array: origin: [FRONT_END, 'http://localhost:5173']
app.use(cors({origin: FRONT_END,credentials: true}));

// Middleware

app.set('trust proxy', 1);
app.use(session({
  store:  new RedisStore({ client: redisClient }),
  secret: 'netsuite-secret',
  resave: false,
  saveUninitialized: true,
  name: 'connect.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 minutes
  }
}));

//End Actual Environment


// Healthcheck
app.get('/healthz', (req, res) => res.json({ ok: true }));
// Mount routes

app.use('/auth', authRoutes({ redisClient }));

app.use('/netsuite', restletRoutes({ redisClient }));


// Serve frontend in production

app.use(express.static(path.join(__dirname, '../app/build')));
app.get('*', (req, res) => {
  res.send('Welcome to the homepage!');
  //res.sendFile(path.join(__dirname, '../app/build/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

