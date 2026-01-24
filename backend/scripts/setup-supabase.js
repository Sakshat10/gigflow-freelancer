import 'dotenv/config';
import { supabase, STORAGE_BUCKET } from '../src/lib/supabase.js';

/**
 * Setup script to create the required Supabase storage bucket
 * Run this after setting up your Supabase environment variables
 */
async function setupSupabaseStorage() {
    console.log('🚀 Setting up Supabase Storage for GigFlow...');
    
    try {
        // Check if bucket already exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check your SUPABASE_URL in .env');
            console.log('2. Check your SUPABASE_SERVICE_ROLE_KEY in .env');
            console.log('3. Verify your Supabase project is active');
            return;
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
        
        if (bucketExists) {
            console.log(`✅ Bucket '${STORAGE_BUCKET}' already exists`);
        } else {
            // Create the bucket
            const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
                public: false, // Private bucket for security
                allowedMimeTypes: [
                    // Images
                    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
                    // Documents
                    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain', 'text/csv',
                    // Archives
                    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
                    // Code files
                    'text/javascript', 'text/css', 'text/html', 'application/json',
                    // Other
                    'application/octet-stream'
                ],
                fileSizeLimit: 10485760 // 10MB limit
            });
            
            if (error) {
                console.error('❌ Error creating bucket:', error.message);
                return;
            }
            
            console.log(`✅ Successfully created bucket '${STORAGE_BUCKET}'`);
        }
        
        console.log('\n🎉 Supabase Storage setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Make sure your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
        console.log('2. Start your server with: npm run dev');
        console.log('3. Test file upload through your API endpoints');
        console.log('\n📁 File storage structure:');
        console.log(`   ${STORAGE_BUCKET}/`);
        console.log('   └── workspaces/');
        console.log('       └── {workspaceId}/');
        console.log('           └── {timestamp}_{filename}');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
        console.log('2. Make sure you have the correct permissions in Supabase');
        console.log('3. Verify your Supabase project is active');
        console.log('4. Ensure @supabase/supabase-js is installed: npm install @supabase/supabase-js');
    }
}

// Run the setup
setupSupabaseStorage();