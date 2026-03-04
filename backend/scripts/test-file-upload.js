import 'dotenv/config';
import { uploadFile, getSignedUrl, deleteFile } from '../src/lib/imagekit.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Test script to verify file upload functionality
 */
async function testFileUpload() {
    console.log('🧪 Testing ImageKit file upload system...\n');

    try {
        if (!process.env.IMAGEKIT_URL_ENDPOINT || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
            console.error('❌ Missing ImageKit environment variables');
            return;
        }

        console.log('✅ Found ImageKit Credentials.');

        // Test 3: Test file upload
        console.log('\n1️⃣ Testing file upload...');
        const testWorkspaceId = `test-workspace-${uuidv4().substring(0, 8)}`;
        const testFilename = 'test-document.txt';
        const testContent = 'This is a test file for ClientDocks file upload system.\nTesting ImageKit Storage integration.';
        const testBuffer = Buffer.from(testContent, 'utf8');

        const uploadResult = await uploadFile(testWorkspaceId, testFilename, testBuffer, 'text/plain');

        if (!uploadResult.success) {
            console.error('❌ Upload test failed:', uploadResult.error);
            return;
        }

        console.log('✅ File upload successful');
        console.log(`📁 Storage path: ${uploadResult.storagePath}`);

        // Test 4: Test signed URL generation
        console.log('\n2️⃣ Testing signed URL generation...');
        const signedUrlResult = await getSignedUrl(uploadResult.storagePath, 300);

        if (!signedUrlResult.success) {
            console.error('❌ Signed URL test failed:', signedUrlResult.error);
            return;
        }

        console.log('✅ Signed URL generation successful');
        console.log(`🔗 URL expires in 5 minutes: ${signedUrlResult.signedUrl.substring(0, 50)}...`);

        console.log('\nWaiting a few seconds before deleting...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 5: Test file deletion
        console.log('\n3️⃣ Testing file deletion...');
        const deleteResult = await deleteFile(uploadResult.storagePath);

        if (!deleteResult.success) {
            console.error('❌ Delete test failed:', deleteResult.error);
            return;
        }

        console.log('✅ API call to delete file was successful.');

        // Success summary
        console.log('\n🎉 All tests passed! Your file upload system is working correctly with ImageKit.');
        console.log('\n📋 Test Summary:');
        console.log('✅ File upload working');
        console.log('✅ Signed URL generation working');
        console.log('✅ File deletion working');

        console.log('\n🚀 Ready for production use!');

    } catch (error) {
        console.error('\n💥 Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting checklist:');
        console.log('1. Check your IMAGEKIT_* variables in your .env file');
        console.log('2. Ensure all dependencies are installed: npm install');
    }
}

// Run the test
testFileUpload();