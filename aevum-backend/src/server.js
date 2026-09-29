const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'AEVUM Secure REST API active (TLS/AES-256 enabled)' });
});

app.listen(PORT, () => {
  console.log(`AEVUM Backend running on port ${PORT}`);
});