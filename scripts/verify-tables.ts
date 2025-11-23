/**
 * Supabase Table Verification Script
 * 
 * This script verifies that all required tables exist in the Supabase database
 * and checks if they contain data. Useful for debugging database setup issues.
 * 
 * Usage:
 *   npx tsx scripts/verify-tables.ts
 * 
 * Requirements:
 *   - VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Tables we expect to exist
const EXPECTED_TABLES = [
    'profiles',
    'notifications',
    'business_verifications',
    'jobs',
    'gigs',
    'portfolio_items',
    'assignments',
    'applications'
];

interface TableInfo {
    name: string;
    exists: boolean;
    rowCount: number;
    error?: string;
}

async function checkTable(tableName: string): Promise<TableInfo> {
    const info: TableInfo = {
        name: tableName,
        exists: false,
        rowCount: 0
    };

    try {
        // Try to count rows in the table
        const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            if (error.message.includes('does not exist') || error.code === '42P01') {
                info.error = 'Table does not exist';
            } else {
                info.error = error.message;
            }
        } else {
            info.exists = true;
            info.rowCount = count || 0;
        }
    } catch (err) {
        info.error = err instanceof Error ? err.message : 'Unknown error';
    }

    return info;
}

async function checkAuthUsers(): Promise<number> {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        return data.users.length;
    } catch (err) {
        console.error('Error checking auth users:', err);
        return 0;
    }
}

async function verifyDatabase() {
    console.log('\n🔍 TrustWork Database Verification');
    console.log('='.repeat(60));
    console.log(`📍 URL: ${supabaseUrl}\n`);

    // Check auth users first
    console.log('👥 Checking Authentication Users...');
    const authUserCount = await checkAuthUsers();
    console.log(`   ${authUserCount > 0 ? '✅' : '⚠️ '} Found ${authUserCount} auth user(s)\n`);

    // Check all tables
    console.log('📊 Checking Database Tables...\n');
    const results: TableInfo[] = [];

    for (const tableName of EXPECTED_TABLES) {
        const info = await checkTable(tableName);
        results.push(info);

        const status = info.exists
            ? (info.rowCount > 0 ? '✅' : '⚠️ ')
            : '❌';

        console.log(`${status} ${tableName.padEnd(25)} ${info.exists
                ? `${info.rowCount} row(s)`
                : info.error || 'Not found'
            }`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 Summary\n');

    const existingTables = results.filter(r => r.exists);
    const missingTables = results.filter(r => !r.exists);
    const emptyTables = results.filter(r => r.exists && r.rowCount === 0);
    const populatedTables = results.filter(r => r.exists && r.rowCount > 0);

    console.log(`✅ Existing: ${existingTables.length}/${EXPECTED_TABLES.length}`);
    console.log(`📦 Populated: ${populatedTables.length}/${EXPECTED_TABLES.length}`);
    console.log(`📭 Empty: ${emptyTables.length}/${EXPECTED_TABLES.length}`);
    console.log(`❌ Missing: ${missingTables.length}/${EXPECTED_TABLES.length}`);

    if (missingTables.length > 0) {
        console.log('\n⚠️  Missing Tables:');
        missingTables.forEach(t => console.log(`   - ${t.name}`));
        console.log('\n💡 Run the schema.sql file in Supabase SQL Editor to create missing tables');
    }

    if (emptyTables.length > 0) {
        console.log('\n📭 Empty Tables (consider running seed script):');
        emptyTables.forEach(t => console.log(`   - ${t.name}`));
    }

    if (authUserCount === 0) {
        console.log('\n⚠️  No auth users found!');
        console.log('💡 Create users via:');
        console.log('   - npm run seed (automatic)');
        console.log('   - Supabase Dashboard > Authentication > Add User (manual)');
        console.log('   - See MANUAL_USER_SETUP_GUIDE.md for detailed instructions');
    }

    // Schema check via direct SQL (optional - shows all public tables)
    console.log('\n🔎 All Public Tables in Database:');
    try {
        const { data, error } = await supabase.rpc('get_table_names', {});

        if (error) {
            // Fallback: show what we checked
            console.log('   (Using expected table list)');
            existingTables.forEach(t => console.log(`   - ${t.name}`));
        }
    } catch {
        // If function doesn't exist, just show our results
        console.log('   (Based on verification results above)');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Exit code
    if (missingTables.length > 0) {
        console.log('❌ Verification failed: missing required tables\n');
        process.exit(1);
    } else {
        console.log('✅ All expected tables exist!\n');
        process.exit(0);
    }
}

verifyDatabase();
