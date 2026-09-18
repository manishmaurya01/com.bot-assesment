const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const featureRoutes = require('./routes/featureRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/features', featureRoutes);
app.use('/api/v1/features/:featureId/comments', commentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Base route test
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

module.exports = app;