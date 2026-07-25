#!/usr/bin/env node

/**
 * Safe Prisma Generate Script
 * 
 * This script ensures Prisma client generation works even when DATABASE_URL is not set.
 * It provides a dummy URL for type generation during builds, preventing build failures.
 * 
 * Runtime database checks in database.ts prevent actual connections to the dummy URL.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

console.log('[prisma-generate] Loading environment from:', envPath);

// Check if DATABASE_URL is set
const hasRealDatabaseUrl = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy');

// Use dummy URL if not set (for builds and team members without database)
const databaseUrl = hasRealDatabaseUrl
  ? process.env.DATABASE_URL
  : 'postgresql://dummy:dummy@localhost:5432/dummy';

console.log('[prisma-generate]', hasRealDatabaseUrl 
  ? '✅ Using real DATABASE_URL' 
  : '⚠️  Using dummy DATABASE_URL (database will be disabled at runtime)'
);

// Prisma schema is in parent directory (project root)
const schemaPath = join(__dirname, '..', '..', 'prisma', 'schema.prisma');

try {
  // Run prisma generate with explicit schema path
  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  
  console.log('[prisma-generate] ✅ Prisma client generated successfully');
  
  if (!hasRealDatabaseUrl) {
    console.log('[prisma-generate] ℹ️  Database persistence will be disabled at runtime');
    console.log('[prisma-generate] ℹ️  Set DATABASE_URL in backend/.env to enable database features');
  }
} catch (error) {
  console.error('[prisma-generate] ❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}
