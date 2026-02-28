import 'dotenv/config';
import { supabase, STORAGE_BUCKET, uploadFile, getSignedUrl, deleteFile } from '../src/lib/supabase.js';

/**
 * Test script to verify file upload functionality
 */
async function testFileUpload() {
    console.log('🧪 Testing ClientDocks file upload system...\n');
    
    try {
        // Test 1: Check Supabase connection
        console.log('1️⃣ Testing Supabase connection...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Connection failed:', listError.message);
            return;
        }
        
        console.log('✅ Connected to Supabase successfully');
        
        // Test 2: Check bucket exists
        console.log('\n2️⃣ Checking workspace-files bucket...');
        const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
        
        if (!bucketExists) {
            console.log(`❌ Bucket '${STORAGE_BUCKET}' not found`);
            console.log('💡 Run: node scripts/setup-supabase.js');
            return;
        }
        
        console.log(`✅ Bucket '${STORAGE_BUCKET}' exists`);
        
        // Test 3: Test file upload
        console.log('\n3️⃣ Testing file upload...');
        const testWorkspaceId = 'test-workspace-123';
        const testFilename = 'test-document.txt';
        const testContent = 'This is a test file for ClientDocks file upload system.\nTesting Supabase Storage integration.';
        const testBuffer = Buffer.from(testContent, 'utf8');
        
        const uploadResult = await uploadFile(testWorkspaceId, testFilename, testBuffer, 'text/plain');
        
        if (!uploadResult.success) {
            console.error('❌ Upload test failed:', uploadResult.error);
            return;
        }
        
        console.log('✅ File upload successful');
        console.log(`📁 Storage path: ${uploadResult.storagePath}`);
        
        // Test 4: Test signed URL generation
        console.log('\n4️⃣ Testing signed URL generation...');
        const signedUrlResult = await getSignedUrl(uploadResult.storagePath, 300);
        
        if (!signedUrlResult.success) {
            console.error('❌ Signed URL test failed:', signedUrlResult.error);
            return;
        }
        
        console.log('✅ Signed URL generation successful');
        console.log(`🔗 URL expires in 5 minutes`);
        
        // Test 5: Test file deletion
        console.log('\n5️⃣ Testing file deletion...');
        const deleteResult = await deleteFile(uploadResult.storagePath);
        
        if (!deleteResult.success) {
            console.error('❌ Delete test failed:', deleteResult.error);
            return;
        }
        
        console.log('✅ File deletion successful');
        
        // Success summary
        console.log('\n🎉 All tests passed! Your file upload system is working correctly.');
        console.log('\n📋 Test Summary:');
        console.log('✅ Supabase connection established');
        console.log('✅ Storage bucket configured');
        console.log('✅ File upload working');
        console.log('✅ Signed URL generation working');
        console.log('✅ File deletion working');
        
        console.log('\n🚀 Ready for production use!');
        console.log('\n📡 API Endpoints:');
        console.log('• POST /api/workspaces/:id/files (Freelancer upload)');
        console.log('• POST /api/client/:shareToken/files (Client upload)');
        console.log('• GET /api/workspaces/:id/files (List files)');
        console.log('• GET /api/workspaces/:id/files/:fileId/download (Download)');
        console.log('• DELETE /api/workspaces/:id/files/:fileId (Delete - Freelancer only)');
        
    } catch (error) {
        console.error('\n💥 Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting checklist:');
        console.log('1. Check SUPABASE_URL in your .env file');
        console.log('2. Check SUPABASE_SERVICE_ROLE_KEY in your .env file');
        console.log('3. Run: node scripts/setup-supabase.js');
        console.log('4. Verify your Supabase project permissions');
        console.log('5. Ensure all dependencies are installed: npm install');
    }
}

// Run the test
testFileUpload();