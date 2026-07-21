const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', /\.vercel\.app$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Stock ID Server Active' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user/auth', require('./routes/user.auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/members', require('./routes/member.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/content', require('./routes/content.routes'));
app.use('/api/modules', require('./routes/module.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
  })
  .catch((err) => { console.error('MongoDB connection error:', err); process.exit(1); });