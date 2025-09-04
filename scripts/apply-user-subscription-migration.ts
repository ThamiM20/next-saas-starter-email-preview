import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

async function applyMigration() {
  console.log('Starting migration: Add subscription fields to users table');
  
  try {
    // Add new columns
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive',
      ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50);
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

applyMigration();
