import 'dotenv/config';
import { imagekit } from '../src/lib/imagekit.js';

/**
 * Setup script to verify ImageKit credentials and connection
 */
async function setupImageKit() {
    console.log('🚀 Checking ImageKit setup for ClientDocks...');

    try {
        if (!process.env.IMAGEKIT_URL_ENDPOINT || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
            console.error('❌ Missing ImageKit environment variables');
            return;
        }

        console.log('✅ Found ImageKit credentials');

        // Try to access ImageKit by listing files
        const files = await new Promise((resolve, reject) => {
            imagekit.listFiles({
                limit: 1
            }, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        });

        console.log('✅ Successfully connected to ImageKit');

        console.log('\n🎉 ImageKit setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Start your server with: npm run dev');
        console.log('2. Test file upload with: npm run test:upload');
        console.log('\n📁 Folders will be created dynamically as: /workspaces/{workspaceId}/');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your IMAGEKIT_* environment variables in .env');
        console.log('2. Ensure your ImageKit account is active');
    }
}

// Run the setup
setupImageKit();