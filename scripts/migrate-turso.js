#!/usr/bin/env node
/**
 * Script to apply Prisma migrations to Turso database
 *
 * Usage:
 *   node scripts/migrate-turso.js
 *
 * Requires environment variables:
 *   DATABASE_TURSO_DATABASE_URL
 *   DATABASE_TURSO_AUTH_TOKEN
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  // Check for required environment variables
  const tursoUrl = process.env.DATABASE_TURSO_DATABASE_URL;
  const tursoToken = process.env.DATABASE_TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Missing required environment variables:');
    console.error('   DATABASE_TURSO_DATABASE_URL');
    console.error('   DATABASE_TURSO_AUTH_TOKEN');
    console.error('\nPull them from Vercel using:');
    console.error('   npx vercel env pull .env.production');
    process.exit(1);
  }

  console.log('🔗 Connecting to Turso database...');
  console.log(`   URL: ${tursoUrl.replace(/\?.*/, '')}`); // Hide auth token in URL

  // Create Turso client
  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  try {
    // Find all migration files
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    const migrationFolders = fs.readdirSync(migrationsDir)
      .filter(f => f !== 'migration_lock.toml')
      .sort();

    console.log(`\n📋 Found ${migrationFolders.length} migration(s):`);
    migrationFolders.forEach((folder, i) => {
      console.log(`   ${i + 1}. ${folder}`);
    });

    // Create a migrations tracking table if it doesn't exist
    console.log('\n🔧 Setting up migration tracking...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS _prisma_migrations (
        id TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        finished_at DATETIME,
        migration_name TEXT NOT NULL,
        logs TEXT,
        rolled_back_at DATETIME,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Apply each migration
    for (const folder of migrationFolders) {
      const migrationPath = path.join(migrationsDir, folder, 'migration.sql');

      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Skipping ${folder} - no migration.sql found`);
        continue;
      }

      // Check if migration was already applied
      const existing = await client.execute({
        sql: 'SELECT migration_name FROM _prisma_migrations WHERE migration_name = ?',
        args: [folder]
      });

      if (existing.rows.length > 0) {
        console.log(`✅ ${folder} - already applied`);
        continue;
      }

      console.log(`\n🔄 Applying ${folder}...`);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Split into individual statements (simple approach - may need refinement)
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let appliedSteps = 0;
      for (const statement of statements) {
        try {
          await client.execute(statement);
          appliedSteps++;
        } catch (error) {
          // Check if it's a "table already exists" error
          if (error.message && error.message.includes('already exists')) {
            console.log(`   ⚠️  ${error.message} - continuing...`);
            appliedSteps++;
          } else {
            throw error;
          }
        }
      }

      // Record the migration
      await client.execute({
        sql: `INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, applied_steps_count)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)`,
        args: [
          folder.substring(0, 36), // Use first 36 chars as ID (timestamp part)
          folder, // Use folder name as checksum
          folder,
          appliedSteps
        ]
      });

      console.log(`✅ ${folder} - applied ${appliedSteps} statement(s)`);
    }

    // Verify tables were created
    console.log('\n🔍 Verifying schema...');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_prisma_%'
      ORDER BY name
    `);

    console.log(`\n✅ Found ${tables.rows.length} table(s):`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.name}`);
    });

    console.log('\n✨ Migration complete! ✨\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.close();
  }
}

applyMigrations();
