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
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_WORKER === 'true') {
    require('./workers/ingestionWorker');
}

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

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
