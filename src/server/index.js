// import './server.mock';
import './server';
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(session({
  secret: 'netsuite-secret',
  resave: false,
  saveUninitialized: true
}));

// Mount routes
app.use('/auth', authRoutes);

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../app/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});