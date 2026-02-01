import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Storage bucket name
export const STORAGE_BUCKET = 'workspace-files';

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
 * Upload file to Supabase Storage
 * @param {string} workspaceId - The workspace ID
 * @param {string} filename - The original filename
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimeType - The MIME type
 * @returns {Promise<{success: boolean, storagePath?: string, error?: string}>}
 */
export async function uploadFile(workspaceId, filename, fileBuffer, mimeType) {
    try {
        const safeFilename = sanitizeFilename(filename);
        console.log('Original filename:', filename);
        console.log('Sanitized filename:', safeFilename);
        
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${safeFilename}`;
        const storagePath = `workspaces/${workspaceId}/${uniqueFilename}`;
        
        console.log('Storage path:', storagePath);
        
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType: mimeType,
                upsert: false // Don't overwrite existing files
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, storagePath };
    } catch (error) {
        console.error('Upload file error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate signed URL for file download
 * @param {string} storagePath - The storage path
 * @param {number} expiresIn - Expiry time in seconds (default: 300 = 5 minutes)
 * @returns {Promise<{success: boolean, signedUrl?: string, error?: string}>}
 */
export async function getSignedUrl(storagePath, expiresIn = 300) {
    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(storagePath, expiresIn);

        if (error) {
            console.error('Supabase signed URL error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, signedUrl: data.signedUrl };
    } catch (error) {
        console.error('Get signed URL error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete file from Supabase Storage
 * @param {string} storagePath - The storage path
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFile(storagePath) {
    try {
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([storagePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete file error:', error);
        return { success: false, error: error.message };
    }
}