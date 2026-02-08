import multer from 'multer';

// Configure multer for memory storage (no local files)
const storage = multer.memoryStorage();

// Allowed MIME types - RESTRICTED to safe types only
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

// Magic bytes for file type validation
const MAGIC_BYTES = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'image/png': [[0x89, 0x50, 0x4E, 0x47]], // PNG
    'image/jpg': [[0xFF, 0xD8, 0xFF]], // JPEG
    'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B, 0x03, 0x04]], // ZIP (docx is a zip)
};

// Validate file content against magic bytes
const validateFileContent = (buffer, mimetype) => {
    const magicBytes = MAGIC_BYTES[mimetype];
    if (!magicBytes) return false;

    // Check if buffer starts with any of the valid magic byte sequences
    return magicBytes.some(sequence => {
        if (buffer.length < sequence.length) return false;
        return sequence.every((byte, index) => buffer[index] === byte);
    });
};

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`File type ${file.mimetype} is not allowed. Only PDF, PNG, JPG, JPEG, and DOCX files are permitted.`), false);
    }

    // Additional check for dangerous extensions
    const filename = file.originalname.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.js', '.html', '.htm', '.php', '.asp', '.aspx', '.jsp'];

    if (dangerousExtensions.some(ext => filename.endsWith(ext))) {
        return cb(new Error('Executable and script files are not allowed'), false);
    }

    cb(null, true);
};

// Configure multer with limits
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Single file per request
    }
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Middleware to validate file content after upload
export const validateFileContentMiddleware = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    // Validate file content matches declared MIME type
    if (!validateFileContent(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({
            error: 'File content does not match the declared file type. Possible file type spoofing detected.'
        });
    }

    next();
};

// Error handler for multer errors
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field. Use "file" field name.' });
        }
    }

    if (error && error.message.includes('File type')) {
        return res.status(400).json({ error: error.message });
    }

    if (error && error.message.includes('Executable')) {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};