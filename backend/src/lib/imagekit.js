import ImageKit from 'imagekit';

const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

if (!urlEndpoint || !publicKey || !privateKey) {
    throw new Error('Missing ImageKit environment variables: IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY are required');
}

export const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint
});

/**
 * Sanitize filename to be safe for storage
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export function sanitizeFilename(filename) {
    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

    // Remove all non-ASCII characters and special characters
    // Keep only alphanumeric, hyphens, underscores, and dots
    const sanitizedName = name
        .normalize('NFD') // Normalize unicode characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .toLowerCase();

    // Ensure it's not empty
    const finalName = sanitizedName || 'file';

    // Limit length and add extension back
    return (finalName.substring(0, 100) + extension).toLowerCase();
}

/**
 * Upload file to ImageKit with UUID-based naming
 * @param {string} workspaceId - The workspace ID
 * @param {string} filename - The original filename
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimeType - The MIME type
 * @returns {Promise<{success: boolean, storagePath?: string, originalFilename?: string, error?: string}>}
 */
export async function uploadFile(workspaceId, filename, fileBuffer, mimeType) {
    try {
        // Generate UUID-based filename for security
        const { v4: uuidv4 } = await import('uuid');

        const lastDotIndex = filename.lastIndexOf('.');
        const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex).toLowerCase() : '';
        const uniqueFilename = `${uuidv4()}${extension}`;

        console.log('Original filename:', filename);
        console.log('UUID filename:', uniqueFilename);

        const uploadResponse = await new Promise((resolve, reject) => {
            imagekit.upload({
                file: fileBuffer,
                fileName: uniqueFilename,
                folder: `/workspaces/${workspaceId}`,
                useUniqueFileName: false, // We already use uuid
            }, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return {
            success: true,
            storagePath: uploadResponse.filePath, // Use this for deletion and signed URLs
            originalFilename: filename
        };
    } catch (error) {
        console.error('Upload file error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate signed URL for file download
 * @param {string} storagePath - The storage path
 * @param {number} expiresIn - Expiry time in seconds (default: 600 = 10 minutes)
 * @returns {Promise<{success: boolean, signedUrl?: string, error?: string}>}
 */
export async function getSignedUrl(storagePath, expiresIn = 600) {
    try {
        // ImageKit's default signed URL doesn't return attachments, but we can generate an expiring view URL.
        const signedUrl = imagekit.url({
            path: storagePath,
            signed: true,
            expireSeconds: expiresIn
        });

        return { success: true, signedUrl };
    } catch (error) {
        console.error('Get signed URL error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete file from ImageKit
 * @param {string} storagePath - The storage path
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFile(storagePath) {
    try {
        // ImageKit needs the file ID, but we only have the path stored in db right now.
        // We must first get the file details from ImageKit using the path.
        const files = await new Promise((resolve, reject) => {
            imagekit.listFiles({
                path: storagePath.substring(0, storagePath.lastIndexOf('/')),
                searchQuery: `name="${storagePath.substring(storagePath.lastIndexOf('/') + 1)}"`
            }, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (files && files.length > 0) {
            await new Promise((resolve, reject) => {
                imagekit.deleteFile(files[0].fileId, function (error, result) {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Delete file error:', error);
        return { success: false, error: error.message };
    }
}