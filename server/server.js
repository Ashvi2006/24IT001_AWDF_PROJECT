const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables (supports running from both root and server directory)
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Request Logging Middleware ───
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📋 [${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Core Middleware ───
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Student Portfolio API is running',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Start Server & Initiate DB Connection ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB();
});
