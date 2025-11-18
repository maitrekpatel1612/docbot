/**
 * Express App
 * Main application entry point
 */

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import middleware
import { initializeSession } from './middleware/sessionMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

// Import services
import sessionService from './services/sessionService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_TTL) || 1800000 // 30 minutes
    }
}));

// Initialize session middleware
app.use(initializeSession);

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/session', sessionRoutes);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'RAG Chatbot API is running',
        data: {
            activeSessions: sessionService.getSessionCount(),
            timestamp: Date.now()
        }
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Start session cleanup service
    sessionService.startCleanupService();
    console.log('Session cleanup service started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    sessionService.stopCleanupService();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    sessionService.stopCleanupService();
    process.exit(0);
});

export default app;
