/**
 * Error Handler Middleware
 * Global error handling for Express app
 */

export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File size exceeds the maximum limit'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            error: 'Too many files uploaded at once'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            error: 'Unexpected field in upload'
        });
    }

    // Custom validation errors
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Session errors
    if (err.message.includes('Session not found')) {
        return res.status(404).json({
            success: false,
            error: 'Session not found or expired'
        });
    }

    // Document processing errors
    if (err.message.includes('No documents')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Gemini API errors
    if (err.message.includes('GOOGLE_API_KEY')) {
        return res.status(500).json({
            success: false,
            error: 'Server configuration error'
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'An unexpected error occurred'
    });
}

export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
}
