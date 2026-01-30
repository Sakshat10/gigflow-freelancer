import { Resend } from "resend";

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

/**
 * Send a single email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body (HTML supported)
 * @param {string} fromName - Sender name (default: GigFlow)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendEmail(to, subject, body, fromName = "GigFlow") {
    if (!resend) {
        console.warn("Email service not configured: RESEND_API_KEY is missing");
        return {
            success: false,
            error: "Email service not configured. Please add RESEND_API_KEY to your environment."
        };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `${fromName} <onboarding@resend.dev>`, // Using Resend's default domain for now
            to: [to],
            subject: subject,
            html: body,
        });

        if (error) {
            console.error("Failed to send email:", error);
            return { success: false, error: error.message };
        }

        console.log("Email sent successfully:", data);
        return { success: true, data };
    } catch (err) {
        console.error("Error sending email:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Send bulk emails to multiple recipients
 * @param {Array<{email: string, name?: string}>} recipients - List of recipients
 * @param {string} subject - Email subject
 * @param {string} body - Email body (HTML supported, can use {{name}} for personalization)
 * @param {string} fromName - Sender name
 * @returns {Promise<{success: boolean, sent: number, failed: number, errors: string[]}>}
 */
export async function sendBulkEmails(recipients, subject, body, fromName = "GigFlow") {
    const results = {
        success: true,
        sent: 0,
        failed: 0,
        errors: []
    };

    for (const recipient of recipients) {
        // Personalize body with recipient name if available
        const personalizedBody = recipient.name
            ? body.replace(/\{\{name\}\}/g, recipient.name)
            : body.replace(/\{\{name\}\}/g, "there");

        const result = await sendEmail(recipient.email, subject, personalizedBody, fromName);
        
        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            results.errors.push(`${recipient.email}: ${result.error}`);
        }
    }

    results.success = results.failed === 0;
    return results;
}

/**
 * Send automated notification email
 * @param {string} type - Notification type: 'new-message' | 'new-invoice' | 'file-upload'
 * @param {Object} data - Data for the notification
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendNotificationEmail(type, data) {
    const templates = {
        "new-message": {
            subject: `New message in ${data.workspaceName || "your workspace"}`,
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">📬 New Message Received</h2>
                    <p>You have a new message in your workspace <strong>${data.workspaceName || "Unknown"}</strong>.</p>
                    ${data.messagePreview ? `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #666;">${data.messagePreview}</blockquote>` : ""}
                    <a href="${data.link || "#"}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Message</a>
                    <p style="color: #999; margin-top: 24px; font-size: 12px;">You're receiving this email because you have notifications enabled in GigFlow.</p>
                </div>
            `
        },
        "new-invoice": {
            subject: `Invoice ${data.invoiceNumber || ""} from ${data.freelancerName || "your freelancer"}`,
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">📄 New Invoice</h2>
                    <p>A new invoice has been created for you.</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;">
                        <p><strong>Invoice Number:</strong> ${data.invoiceNumber || "N/A"}</p>
                        <p><strong>Amount:</strong> ${data.currency || "$"}${data.amount || "0.00"}</p>
                        <p><strong>Due Date:</strong> ${data.dueDate || "N/A"}</p>
                    </div>
                    ${data.paymentUrl ? `<a href="${data.paymentUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Pay Now</a>` : ""}
                    <p style="color: #999; margin-top: 24px; font-size: 12px;">You're receiving this email because an invoice was created for you in GigFlow.</p>
                </div>
            `
        },
        "file-upload": {
            subject: `New file uploaded in ${data.workspaceName || "your workspace"}`,
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">📎 New File Uploaded</h2>
                    <p>A new file has been uploaded to your workspace <strong>${data.workspaceName || "Unknown"}</strong>.</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;">
                        <p><strong>File Name:</strong> ${data.filename || "Unknown"}</p>
                        <p><strong>Uploaded By:</strong> ${data.uploadedBy || "Unknown"}</p>
                    </div>
                    <a href="${data.link || "#"}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View File</a>
                    <p style="color: #999; margin-top: 24px; font-size: 12px;">You're receiving this email because you have notifications enabled in GigFlow.</p>
                </div>
            `
        }
    };

    const template = templates[type];
    if (!template) {
        return { success: false, error: `Unknown notification type: ${type}` };
    }

    if (!data.recipientEmail) {
        return { success: false, error: "Recipient email is required" };
    }

    return sendEmail(data.recipientEmail, template.subject, template.body);
}

/**
 * Check if email service is configured
 * @returns {boolean}
 */
export function isEmailConfigured() {
    return !!resend;
}

export default {
    sendEmail,
    sendBulkEmails,
    sendNotificationEmail,
    isEmailConfigured
};
