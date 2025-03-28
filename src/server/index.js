// import './server.mock';

const express = require('express');
const session = require('express-session');
const path = require('path');
const restletRoutes = require('./routes/restlet');
const authRoutes = require('./routes/auth');
const {FRONT_END} = require('./lib/nsOAuth').staticVar;



require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(session({
  secret: 'netsuite-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: 'none',
  }
}));
app.use(cors({origin:FRONT_END,credentials: true}));

// Mount routes

app.use('/auth', authRoutes);
app.use('/netsuite', restletRoutes);


// Serve frontend in production
app.use(express.static(path.join(__dirname, '../app/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

