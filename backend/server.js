require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const syncRoutes = require('./routes/syncRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Start Worker (Only in non-serverless environments or if explicitly enabled)
// We explicitly skip this on Vercel to prevent startup crashes or timeouts
if (!process.env.VERCEL && (process.env.NODE_ENV !== 'production' || process.env.ENABLE_WORKER === 'true')) {
    try {
        require('./workers/ingestionWorker');
        console.log('Worker started');
    } catch (e) {
        console.warn('Failed to start worker:', e.message);
    }
}

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Health Check
app.get('/', (req, res) => res.send('Xeno Store Backend is Running!'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sync', syncRoutes);
app.use('/webhooks', webhookRoutes);

const PORT = process.env.PORT || 5000;

// For Vercel/Serverless, we export the app instead of listening
if (process.env.VERCEL) {
    module.exports = app;
} else {
    sequelize.sync({ alter: true }).then(() => {
        console.log('Database synced');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }).catch(err => console.error('DB Error:', err));
}
