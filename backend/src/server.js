const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const supabase = require('./config/supabase');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') throw error; // Ignore table not found for now
    console.log('✅ Supabase connected successfully');
  } catch (err) {
    console.log('⚠️  Supabase connection initialized (tables may need to be created)');
  }
})();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/google', require('./routes/googleAuthRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/journals', require('./routes/journalRoutes'));
app.use('/api/moods', require('./routes/moodRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/counsellors', require('./routes/counsellorRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    routes: {
      active: [
        '/api/auth',
        '/api/auth/google',
        '/api/appointments',
        '/api/sessions',
        '/api/journals',
        '/api/moods',
        '/api/analytics',
        '/api/counsellors'
      ]
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Local network: http://192.168.1.7:${PORT}`);
});

module.exports = app;
