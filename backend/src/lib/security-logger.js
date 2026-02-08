import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ip, user, action, details, stack }) => {
        let log = `${timestamp} [${level.toUpperCase()}]`;
        if (ip) log += ` IP:${ip}`;
        if (user) log += ` User:${user}`;
        if (action) log += ` Action:${action}`;
        log += ` - ${message}`;
        if (details) log += ` | Details: ${JSON.stringify(details)}`;
        if (stack) log += `\n${stack}`;
        return log;
    })
);

// Security events logger (login failures, permission denials, etc.)
const securityTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info'
});

// Error logger
const errorTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error'
});

// Combined logger
const combinedTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
});

// Create logger instance
const logger = winston.createLogger({
    format: logFormat,
    transports: [
        securityTransport,
        errorTransport,
        combinedTransport
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    }));
}

// Security event logging functions
export const securityLogger = {
    // Login events
    loginSuccess: (email, ip) => {
        logger.info('Login successful', {
            action: 'LOGIN_SUCCESS',
            user: email,
            ip
        });
    },

    loginFailure: (email, ip, reason = 'Invalid credentials') => {
        logger.warn('Login failed', {
            action: 'LOGIN_FAILURE',
            user: email,
            ip,
            details: { reason }
        });
    },

    // File operations
    fileUpload: (userId, workspaceId, filename, size, mimetype, ip) => {
        logger.info('File uploaded', {
            action: 'FILE_UPLOAD',
            user: userId,
            ip,
            details: { workspaceId, filename, size, mimetype }
        });
    },

    fileDownload: (userId, workspaceId, filename, ip) => {
        logger.info('File downloaded', {
            action: 'FILE_DOWNLOAD',
            user: userId,
            ip,
            details: { workspaceId, filename }
        });
    },

    fileDelete: (userId, workspaceId, filename, ip) => {
        logger.info('File deleted', {
            action: 'FILE_DELETE',
            user: userId,
            ip,
            details: { workspaceId, filename }
        });
    },

    // Invoice operations
    invoiceCreated: (userId, workspaceId, invoiceId, amount, clientName, ip) => {
        logger.info('Invoice created', {
            action: 'INVOICE_CREATE',
            user: userId,
            ip,
            details: { workspaceId, invoiceId, amount, clientName }
        });
    },

    invoiceStatusChange: (userId, invoiceId, fromStatus, toStatus, ip) => {
        logger.info('Invoice status changed', {
            action: 'INVOICE_STATUS_CHANGE',
            user: userId,
            ip,
            details: { invoiceId, fromStatus, toStatus }
        });
    },

    // Email operations
    emailSent: (userId, recipient, emailType, ip) => {
        logger.info('Email sent', {
            action: 'EMAIL_SENT',
            user: userId,
            ip,
            details: { recipient, emailType }
        });
    },

    // Permission denials
    permissionDenied: (userId, resource, action, ip) => {
        logger.warn('Permission denied', {
            action: 'PERMISSION_DENIED',
            user: userId,
            ip,
            details: { resource, action }
        });
    },

    // Rate limiting
    rateLimitExceeded: (ip, endpoint, limit) => {
        logger.warn('Rate limit exceeded', {
            action: 'RATE_LIMIT_EXCEEDED',
            ip,
            details: { endpoint, limit }
        });
    },

    // IP blocking
    ipBlocked: (ip, reason, duration) => {
        logger.warn('IP blocked', {
            action: 'IP_BLOCKED',
            ip,
            details: { reason, duration }
        });
    },

    // Suspicious activity
    suspiciousActivity: (userId, activity, ip, details) => {
        logger.error('Suspicious activity detected', {
            action: 'SUSPICIOUS_ACTIVITY',
            user: userId,
            ip,
            details: { activity, ...details }
        });

        // In production, this could trigger alerts (email, Slack, etc.)
        if (process.env.NODE_ENV === 'production') {
            // TODO: Implement alert mechanism (email, Slack webhook, etc.)
            console.error(`🚨 SECURITY ALERT: ${activity} from ${ip}`);
        }
    }
};

// General error logging
export const logError = (error, context = {}) => {
    logger.error(error.message, {
        stack: error.stack,
        details: context
    });
};

export default logger;
