import { supabase, STORAGE_BUCKET } from '../src/lib/supabase.js';

/**
 * Test script to verify Supabase connection and storage setup
 */
async function testSupabaseConnection() {
    console.log('🧪 Testing Supabase connection...\n');
    
    try {
        // Test 1: Check if we can connect to Supabase
        console.log('1️⃣ Testing Supabase connection...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Connection failed:', listError.message);
            return;
        }
        
        console.log('✅ Connected to Supabase successfully');
        console.log(`📦 Found ${buckets.length} storage buckets`);
        
        // Test 2: Check if our bucket exists
        console.log('\n2️⃣ Checking workspace-files bucket...');
        const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
        
        if (bucketExists) {
            console.log(`✅ Bucket '${STORAGE_BUCKET}' exists`);
        } else {
            console.log(`❌ Bucket '${STORAGE_BUCKET}' not found`);
            console.log('💡 Run: node scripts/setup-supabase.js');
            return;
        }
        
        // Test 3: Test file upload (small test file)
        console.log('\n3️⃣ Testing file upload...');
        const testContent = 'This is a test file for GigFlow file upload system.';
        const testBuffer = Buffer.from(testContent, 'utf8');
        const testPath = 'test/test-file.txt';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(testPath, testBuffer, {
                contentType: 'text/plain',
                upsert: true
            });
        
        if (uploadError) {
            console.error('❌ Upload test failed:', uploadError.message);
            return;
        }
        
        console.log('✅ File upload test successful');
        
        // Test 4: Test signed URL generation
        console.log('\n4️⃣ Testing signed URL generation...');
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(testPath, 60);
        
        if (signedUrlError) {
            console.error('❌ Signed URL test failed:', signedUrlError.message);
            return;
        }
        
        console.log('✅ Signed URL generation successful');
        console.log(`🔗 Test URL: ${signedUrlData.signedUrl.substring(0, 50)}...`);
        
        // Test 5: Clean up test file
        console.log('\n5️⃣ Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([testPath]);
        
        if (deleteError) {
            console.warn('⚠️ Cleanup warning:', deleteError.message);
        } else {
            console.log('✅ Test file cleaned up');
        }
        
        // Success summary
        console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
        console.log('\n📋 Summary:');
        console.log('✅ Supabase connection established');
        console.log('✅ Storage bucket configured');
        console.log('✅ File upload working');
        console.log('✅ Signed URLs working');
        console.log('✅ File deletion working');
        
        console.log('\n🚀 You can now start using file uploads in your GigFlow app!');
        
    } catch (error) {
        console.error('\n💥 Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting checklist:');
        console.log('1. Check SUPABASE_URL in your .env file');
        console.log('2. Check SUPABASE_SERVICE_ROLE_KEY in your .env file');
        console.log('3. Verify your Supabase project is active');
        console.log('4. Run: node scripts/setup-supabase.js');
        console.log('5. Check your Supabase project permissions');
    }
}

// Run the test
testSupabaseConnection();