// import './server.mock';

const express = require('express');
const session = require('express-session');

const {RedisStore} = require("connect-redis")
const {createClient} = require("redis")

const cors = require('cors'); 
const path = require('path');
const restletRoutes = require('./routes/restlet');
const authRoutes = require('./routes/auth');
const {FRONT_END} = require('./lib/nsOAuth').staticVar;



require('dotenv').config();

const app = express();
const PORT = 5000;


//Start Test Environment
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

/*
//Start Actual Environment
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error); // Always connect Redis

// Middleware
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
  store:  new RedisStore({ client: redisClient }),
  secret: 'netsuite-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true
  }
}));
app.use(cors({origin:FRONT_END,credentials: true}));
//End Actual Environment
*/


// Mount routes

app.use('/auth', authRoutes);
app.use('/netsuite', restletRoutes);


// Serve frontend in production

app.use(express.static(path.join(__dirname, '../app/build')));
app.get('*', (req, res) => {
  res.send('Welcome to the homepage!');
  //res.sendFile(path.join(__dirname, '../app/build/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

