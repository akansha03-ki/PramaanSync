const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { seedData } = require('./seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const locationRoutes = require('./routes/locationRoutes');
const exportRoutes = require('./routes/exportRoutes');
const oemRoutes = require('./routes/oemRoutes');
const kmsRoutes = require('./routes/kmsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static evidence upload files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/oem', oemRoutes);
app.use('/api/kms', kmsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Base route health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'PramaanSync Multi-Vendor DVR/NVR Forensic Analysis Platform',
    timestamp: new Date().toISOString()
  });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed database if empty (ensures ephemeral MongoMemoryServer gets populated on fresh boot)
    await seedData(false);

    app.listen(PORT, () => {
      console.log(`=====================================================`);
      console.log(` PramaanSync Backend API Server Running on Port ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
