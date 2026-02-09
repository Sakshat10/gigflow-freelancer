/**
 * 🔒 Security Alerts Service
 * Sends real-time alerts for suspicious security events
 */

import { sendEmail, isEmailConfigured } from './email.js';

// Alert configuration from environment
const ADMIN_EMAIL = process.env.SECURITY_ALERT_EMAIL || process.env.ADMIN_EMAIL;
const SLACK_WEBHOOK_URL = process.env.SLACK_SECURITY_WEBHOOK;
const ALERTS_ENABLED = process.env.ENABLE_SECURITY_ALERTS !== 'false';

// Rate limiting for alerts (prevent spam)
const alertRateLimit = new Map(); // Map<alertType, { count: number, resetTime: Date }>
const MAX_ALERTS_PER_HOUR = 10;

/**
 * Check if we should send an alert (rate limiting)
 */
function shouldSendAlert(alertType) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    const record = alertRateLimit.get(alertType);

    if (!record || record.resetTime < hourAgo) {
        alertRateLimit.set(alertType, { count: 1, resetTime: now });
        return true;
    }

    if (record.count >= MAX_ALERTS_PER_HOUR) {
        return false; // Rate limited
    }

    record.count++;
    return true;
}

/**
 * Send email alert
 */
async function sendEmailAlert(subject, body) {
    if (!ADMIN_EMAIL || !isEmailConfigured()) {
        console.warn('📧 Security alert email not sent: Email not configured or ADMIN_EMAIL not set');
        return false;
    }

    try {
        const result = await sendEmail(
            ADMIN_EMAIL,
            `🚨 [GigFlow Security] ${subject}`,
            body,
            'GigFlow Security'
        );
        return result.success;
    } catch (error) {
        console.error('Failed to send security email alert:', error);
        return false;
    }
}

/**
 * Send Slack webhook alert
 */
async function sendSlackAlert(subject, details) {
    if (!SLACK_WEBHOOK_URL) {
        return false;
    }

    try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: `🚨 *Security Alert*: ${subject}`,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*🚨 Security Alert*\n${subject}`
                        }
                    },
                    {
                        type: 'section',
                        fields: Object.entries(details).map(([key, value]) => ({
                            type: 'mrkdwn',
                            text: `*${key}:*\n${value}`
                        }))
                    },
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: `⏰ ${new Date().toISOString()}`
                            }
                        ]
                    }
                ]
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to send Slack security alert:', error);
        return false;
    }
}

/**
 * Generate HTML email body for security alerts
 */
function generateAlertEmailBody(alertType, details) {
    const detailsHtml = Object.entries(details)
        .map(([key, value]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${key}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td></tr>`)
        .join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">🚨 Security Alert</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">${alertType}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
                <table style="width: 100%; border-collapse: collapse;">
                    ${detailsHtml}
                </table>
            </div>
            
            <div style="background: #1f2937; color: white; padding: 16px; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; font-size: 12px;">
                    <strong>Time:</strong> ${new Date().toISOString()}<br>
                    <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}
                </p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
                This is an automated security alert from GigFlow. Review immediately if unexpected.
            </p>
        </div>
    `;
}

/**
 * Main alert dispatcher
 */
export async function sendSecurityAlert(alertType, details = {}) {
    if (!ALERTS_ENABLED) {
        console.log(`🔕 Security alerts disabled. Would have sent: ${alertType}`);
        return;
    }

    // Always log to console in production
    console.error(`🚨 SECURITY ALERT: ${alertType}`, details);

    // Check rate limit
    if (!shouldSendAlert(alertType)) {
        console.warn(`⚠️ Security alert rate limited: ${alertType}`);
        return;
    }

    // Send alerts in parallel
    const promises = [];

    // Email alert
    const emailBody = generateAlertEmailBody(alertType, details);
    promises.push(sendEmailAlert(alertType, emailBody));

    // Slack alert
    promises.push(sendSlackAlert(alertType, details));

    const results = await Promise.allSettled(promises);

    const emailSent = results[0]?.value === true;
    const slackSent = results[1]?.value === true;

    if (!emailSent && !slackSent) {
        console.warn('⚠️ Failed to send security alert through any channel');
    }
}

// Pre-defined alert types with helper functions
export const securityAlerts = {
    // Suspicious login activity
    suspiciousLogin: (ip, email, reason) => sendSecurityAlert('Suspicious Login Attempt', {
        'IP Address': ip,
        'Email': email,
        'Reason': reason
    }),

    // IP blocked
    ipBlocked: (ip, reason, duration) => sendSecurityAlert('IP Address Blocked', {
        'IP Address': ip,
        'Reason': reason,
        'Duration': duration
    }),

    // Multiple failed logins
    bruteForceDetected: (ip, attempts, timeWindow) => sendSecurityAlert('Brute Force Attack Detected', {
        'IP Address': ip,
        'Failed Attempts': attempts,
        'Time Window': timeWindow
    }),

    // Rate limit exceeded multiple times
    persistentRateLimitViolation: (ip, endpoint, violationCount) => sendSecurityAlert('Persistent Rate Limit Violation', {
        'IP Address': ip,
        'Endpoint': endpoint,
        'Violation Count': violationCount
    }),

    // Unauthorized access attempt
    unauthorizedAccess: (userId, resource, ip) => sendSecurityAlert('Unauthorized Access Attempt', {
        'User ID': userId || 'Anonymous',
        'Resource': resource,
        'IP Address': ip
    }),

    // File type spoofing detected
    fileTypeSpoofing: (ip, declaredType, actualType, userId) => sendSecurityAlert('File Type Spoofing Detected', {
        'IP Address': ip,
        'Declared Type': declaredType,
        'Actual Type': actualType,
        'User ID': userId || 'Anonymous'
    }),

    // Suspicious invoice activity
    suspiciousInvoiceActivity: (userId, action, details, ip) => sendSecurityAlert('Suspicious Invoice Activity', {
        'User ID': userId,
        'Action': action,
        'Details': JSON.stringify(details),
        'IP Address': ip
    }),

    // Generic suspicious activity
    generic: (activity, ip, details) => sendSecurityAlert(activity, {
        'IP Address': ip,
        ...details
    })
};

export default securityAlerts;
