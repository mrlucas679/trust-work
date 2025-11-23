/**
 * Storage Bucket Verification Script
 * 
 * Verifies that all Supabase Storage buckets are created and configured correctly.
 * Run with: node --loader tsx scripts/verify-storage.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

interface BucketInfo {
    name: string
    expectedSize: number
    purpose: string
    public: boolean
}

const EXPECTED_BUCKETS: BucketInfo[] = [
    { name: 'resumes', expectedSize: 10, purpose: 'User CVs/resumes', public: false },
    { name: 'avatars', expectedSize: 5, purpose: 'Profile pictures', public: true },
    { name: 'company-logos', expectedSize: 5, purpose: 'Company branding', public: true },
    { name: 'attachments', expectedSize: 20, purpose: 'Job attachments', public: true },
]

async function verifyStorageSetup() {
    console.log('🔍 Verifying Supabase Storage Setup...\n')

    // Check environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables!')
        console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
        console.error('   VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗')
        process.exit(1)
    }

    console.log('✅ Environment variables loaded')
    console.log(`   URL: ${SUPABASE_URL}`)
    console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`)

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // List buckets
    console.log('📦 Checking storage buckets...\n')
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
        console.error('❌ Failed to list buckets:', error.message)
        process.exit(1)
    }

    if (!buckets || buckets.length === 0) {
        console.error('❌ No storage buckets found!')
        console.error('\n📝 To create buckets, run:')
        console.error('   1. Go to Supabase Dashboard > Storage')
        console.error('   2. Run the SQL script: supabase/storage-setup.sql')
        process.exit(1)
    }

    console.log(`Found ${buckets.length} bucket(s):\n`)

    // Check each expected bucket
    let allFound = true
    const foundBucketNames = buckets.map(b => b.name)

    for (const expected of EXPECTED_BUCKETS) {
        const bucket = buckets.find(b => b.name === expected.name)

        if (!bucket) {
            console.log(`❌ ${expected.name}`)
            console.log(`   Missing! Purpose: ${expected.purpose}`)
            allFound = false
            continue
        }

        console.log(`✅ ${bucket.name}`)
        console.log(`   Purpose: ${expected.purpose}`)
        console.log(`   Public: ${bucket.public ? 'Yes' : 'No'} ${bucket.public !== expected.public ? '(Expected: ' + (expected.public ? 'Yes' : 'No') + ')' : ''}`)
        console.log(`   Size limit: ${bucket.file_size_limit ? (bucket.file_size_limit / (1024 * 1024)).toFixed(0) + 'MB' : 'Unlimited'}`)
        console.log(`   Created: ${new Date(bucket.created_at).toLocaleDateString()}`)
        console.log()
    }

    // Check for unexpected buckets
    const unexpectedBuckets = buckets.filter(
        b => !EXPECTED_BUCKETS.some(expected => expected.name === b.name)
    )

    if (unexpectedBuckets.length > 0) {
        console.log('\n📌 Additional buckets found:')
        unexpectedBuckets.forEach(b => {
            console.log(`   - ${b.name} (${b.public ? 'Public' : 'Private'})`)
        })
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    if (allFound) {
        console.log('✅ All required buckets are configured!')
        console.log('\n🎉 Storage setup is complete and ready to use!')
        console.log('\n📝 Next steps:')
        console.log('   1. Test CV upload at http://localhost:5173/setup')
        console.log('   2. Test CV replacement at http://localhost:5173/settings')
        console.log('   3. Verify files appear in Supabase Dashboard')
    } else {
        console.log('⚠️  Some buckets are missing!')
        console.log('\n📝 To create missing buckets:')
        console.log('   1. Go to Supabase Dashboard > Storage > Create bucket')
        console.log('   2. Or run: supabase/storage-setup.sql in SQL Editor')
    }
    console.log('='.repeat(60))

    // S3 Configuration
    const s3Endpoint = process.env.VITE_SUPABASE_S3_ENDPOINT
    const s3Region = process.env.VITE_SUPABASE_S3_REGION

    if (s3Endpoint && s3Region) {
        console.log('\n🔗 S3 Protocol Configuration:')
        console.log(`   Endpoint: ${s3Endpoint}`)
        console.log(`   Region: ${s3Region}`)
        console.log('   ✅ S3 protocol is configured')
    } else {
        console.log('\nℹ️  S3 protocol not configured (optional)')
    }

    process.exit(0)
}

// Run verification
verifyStorageSetup().catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
})
