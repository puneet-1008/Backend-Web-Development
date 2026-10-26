require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const cookieConfig = require('./config/cookie');

const app = express();
app.use(express.json());
app.use(cookieParser(cookieConfig.secret));
app.use('/auth', authRoutes);
app.use((error, req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' },
    });
  }

  console.error('Request failed:', error && error.name ? error.name : 'Error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on ${port}`));
