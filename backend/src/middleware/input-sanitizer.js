import validator from 'validator';

// HTML escape function
const escapeHtml = (text) => {
    if (!text || typeof text !== 'string') return text;

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

// Strip script tags and dangerous HTML
const stripScripts = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Remove script tags and their content
    let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    cleaned = cleaned.replace(/javascript:/gi, '');

    return cleaned;
};

// Sanitize text input
export const sanitizeText = (text, options = {}) => {
    if (!text || typeof text !== 'string') return text;

    let sanitized = text;

    // Trim whitespace
    sanitized = sanitized.trim();

    // Strip script tags
    if (options.stripScripts !== false) {
        sanitized = stripScripts(sanitized);
    }

    // Escape HTML if requested
    if (options.escapeHtml) {
        sanitized = escapeHtml(sanitized);
    }

    // Limit length if specified
    if (options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
};

// Sanitize email
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return email;

    const trimmed = email.trim().toLowerCase();

    // Validate email format
    if (!validator.isEmail(trimmed)) {
        throw new Error('Invalid email format');
    }

    return validator.normalizeEmail(trimmed);
};

// Sanitize workspace name
export const sanitizeWorkspaceName = (name) => {
    return sanitizeText(name, {
        stripScripts: true,
        escapeHtml: true,
        maxLength: 100
    });
};

// Sanitize workspace description
export const sanitizeWorkspaceDescription = (description) => {
    return sanitizeText(description, {
        stripScripts: true,
        escapeHtml: true,
        maxLength: 500
    });
};

// Sanitize client name
export const sanitizeClientName = (name) => {
    return sanitizeText(name, {
        stripScripts: true,
        escapeHtml: true,
        maxLength: 100
    });
};

// Sanitize message text
export const sanitizeMessage = (text) => {
    return sanitizeText(text, {
        stripScripts: true,
        escapeHtml: true,
        maxLength: 5000
    });
};

// Sanitize todo title
export const sanitizeTodoTitle = (title) => {
    return sanitizeText(title, {
        stripScripts: true,
        escapeHtml: true,
        maxLength: 200
    });
};

// Sanitize file comment
export const sanitizeFileComment = (text) => {
    return sanitizeText(text, {
        stripScripts: true,
        escapeHtml: true,
        maxLength: 1000
    });
};

// Validate and sanitize numeric input
export const sanitizeNumber = (value, options = {}) => {
    const num = parseFloat(value);

    if (isNaN(num)) {
        throw new Error('Invalid number');
    }

    if (options.min !== undefined && num < options.min) {
        throw new Error(`Number must be at least ${options.min}`);
    }

    if (options.max !== undefined && num > options.max) {
        throw new Error(`Number must be at most ${options.max}`);
    }

    if (options.positive && num <= 0) {
        throw new Error('Number must be positive');
    }

    return num;
};

// Middleware to sanitize request body
export const sanitizeBody = (req, res, next) => {
    // Sanitize common text fields
    if (req.body.name) {
        req.body.name = sanitizeText(req.body.name, { stripScripts: true, maxLength: 100 });
    }

    if (req.body.description) {
        req.body.description = sanitizeText(req.body.description, { stripScripts: true, maxLength: 500 });
    }

    if (req.body.text) {
        req.body.text = sanitizeText(req.body.text, { stripScripts: true, maxLength: 5000 });
    }

    if (req.body.title) {
        req.body.title = sanitizeText(req.body.title, { stripScripts: true, maxLength: 200 });
    }

    if (req.body.email) {
        try {
            req.body.email = sanitizeEmail(req.body.email);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    next();
};

// Validate invoice data
export const validateInvoiceData = (data) => {
    const errors = [];

    // Validate amount
    try {
        data.amount = sanitizeNumber(data.amount, { positive: true, max: 1000000 });
    } catch (error) {
        errors.push(`Invalid amount: ${error.message}`);
    }

    // Validate tax percentage
    if (data.taxPercentage !== undefined) {
        try {
            data.taxPercentage = sanitizeNumber(data.taxPercentage, { min: 0, max: 100 });
        } catch (error) {
            errors.push(`Invalid tax percentage: ${error.message}`);
        }
    }

    // Validate client name
    if (data.clientName) {
        data.clientName = sanitizeClientName(data.clientName);
    }

    // Validate due date
    if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        if (isNaN(dueDate.getTime())) {
            errors.push('Invalid due date');
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    return data;
};
