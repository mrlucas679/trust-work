/**
 * Test Storage Upload
 * 
 * Tests actual file upload to verify storage is working.
 * Run with: npm run test-upload
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

async function testUpload() {
    console.log('🧪 Testing Storage Upload...\n')

    // Check environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables!')
        process.exit(1)
    }

    console.log('✅ Environment configured')
    console.log(`   URL: ${SUPABASE_URL}\n`)

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Create a test file (simple text file)
    const testContent = 'This is a test file to verify storage upload works!'
    const testFileName = `test-${Date.now()}.txt`
    const testBucket = 'attachments' // Using public bucket

    console.log(`📤 Uploading test file to "${testBucket}" bucket...`)
    console.log(`   File: ${testFileName}`)
    console.log(`   Size: ${testContent.length} bytes\n`)

    // Try to upload
    const { data, error } = await supabase.storage
        .from(testBucket)
        .upload(testFileName, testContent, {
            contentType: 'text/plain',
            upsert: false,
        })

    if (error) {
        console.error('❌ Upload failed!')
        console.error(`   Error: ${error.message}`)

        if (error.message.includes('not found')) {
            console.error('\n💡 This means the bucket does not exist or is not accessible.')
            console.error('   Please verify:')
            console.error('   1. Bucket exists in Supabase Dashboard')
            console.error('   2. Bucket name matches exactly: "attachments"')
            console.error('   3. RLS policies allow upload')
        }

        process.exit(1)
    }

    console.log('✅ Upload successful!')
    console.log(`   Path: ${data.path}`)
    console.log(`   Full path: ${data.fullPath}\n`)

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(testBucket)
        .getPublicUrl(testFileName)

    console.log('🔗 Public URL:')
    console.log(`   ${urlData.publicUrl}\n`)

    // Try to delete the test file (cleanup)
    console.log('🧹 Cleaning up test file...')
    const { error: deleteError } = await supabase.storage
        .from(testBucket)
        .remove([testFileName])

    if (deleteError) {
        console.warn('⚠️  Could not delete test file:', deleteError.message)
        console.log('   You may need to delete it manually from the Dashboard')
    } else {
        console.log('✅ Test file deleted\n')
    }

    console.log('='.repeat(60))
    console.log('✅ Storage is working correctly!')
    console.log('\n📝 Next steps:')
    console.log('   1. Test CV upload at http://localhost:5173/setup')
    console.log('   2. Upload a PDF/DOC file through the UI')
    console.log('   3. Verify file appears in Supabase Dashboard > Storage')
    console.log('='.repeat(60))

    process.exit(0)
}

// Run test
testUpload().catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
})
