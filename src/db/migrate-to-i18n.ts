/**
 * Database Migration Script: Convert text fields to JSONB LocalizedString format
 *
 * This script converts existing single-language text fields to bilingual JSONB format.
 * Existing content becomes the English version, and Malay (ms) is set to the same value initially.
 *
 * Run with: npx tsx src/db/migrate-to-i18n.ts
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(connectionString)
const db = drizzle(sql)

async function migrateToI18n() {
  console.log('Starting i18n migration...\n')

  try {
    // Step 1: Migrate hero_content table
    console.log('1. Migrating hero_content table...')
    await sql`
      ALTER TABLE hero_content
        ALTER COLUMN title TYPE jsonb USING jsonb_build_object('en', COALESCE(title, ''), 'ms', COALESCE(title, '')),
        ALTER COLUMN subtitle TYPE jsonb USING jsonb_build_object('en', COALESCE(subtitle, ''), 'ms', COALESCE(subtitle, '')),
        ALTER COLUMN description TYPE jsonb USING jsonb_build_object('en', COALESCE(description, ''), 'ms', COALESCE(description, '')),
        ALTER COLUMN cta_text TYPE jsonb USING jsonb_build_object('en', COALESCE(cta_text, ''), 'ms', COALESCE(cta_text, ''))
    `
    console.log('   ✓ hero_content migrated\n')

    // Step 2: Migrate about_content table
    console.log('2. Migrating about_content table...')
    await sql`
      ALTER TABLE about_content
        ALTER COLUMN title TYPE jsonb USING jsonb_build_object('en', COALESCE(title, ''), 'ms', COALESCE(title, '')),
        ALTER COLUMN content TYPE jsonb USING jsonb_build_object('en', COALESCE(content, ''), 'ms', COALESCE(content, '')),
        ALTER COLUMN mission TYPE jsonb USING jsonb_build_object('en', COALESCE(mission, ''), 'ms', COALESCE(mission, '')),
        ALTER COLUMN vision TYPE jsonb USING jsonb_build_object('en', COALESCE(vision, ''), 'ms', COALESCE(vision, ''))
    `
    console.log('   ✓ about_content migrated\n')

    // Step 3: Migrate team_members table
    console.log('3. Migrating team_members table...')
    await sql`
      ALTER TABLE team_members
        ALTER COLUMN position TYPE jsonb USING jsonb_build_object('en', COALESCE(position, ''), 'ms', COALESCE(position, '')),
        ALTER COLUMN bio TYPE jsonb USING jsonb_build_object('en', COALESCE(bio, ''), 'ms', COALESCE(bio, ''))
    `
    console.log('   ✓ team_members migrated\n')

    // Step 4: Migrate blog_posts table
    console.log('4. Migrating blog_posts table...')
    await sql`
      ALTER TABLE blog_posts
        ALTER COLUMN title TYPE jsonb USING jsonb_build_object('en', COALESCE(title, ''), 'ms', COALESCE(title, '')),
        ALTER COLUMN excerpt TYPE jsonb USING jsonb_build_object('en', COALESCE(excerpt, ''), 'ms', COALESCE(excerpt, '')),
        ALTER COLUMN content TYPE jsonb USING jsonb_build_object('en', COALESCE(content, ''), 'ms', COALESCE(content, '')),
        ALTER COLUMN meta_title TYPE jsonb USING jsonb_build_object('en', COALESCE(meta_title, ''), 'ms', COALESCE(meta_title, '')),
        ALTER COLUMN meta_description TYPE jsonb USING jsonb_build_object('en', COALESCE(meta_description, ''), 'ms', COALESCE(meta_description, ''))
    `
    console.log('   ✓ blog_posts migrated\n')

    // Step 5: Migrate projects table
    console.log('5. Migrating projects table...')
    await sql`
      ALTER TABLE projects
        ALTER COLUMN title TYPE jsonb USING jsonb_build_object('en', COALESCE(title, ''), 'ms', COALESCE(title, '')),
        ALTER COLUMN subtitle TYPE jsonb USING jsonb_build_object('en', COALESCE(subtitle, ''), 'ms', COALESCE(subtitle, '')),
        ALTER COLUMN description TYPE jsonb USING jsonb_build_object('en', COALESCE(description, ''), 'ms', COALESCE(description, '')),
        ALTER COLUMN content TYPE jsonb USING jsonb_build_object('en', COALESCE(content, ''), 'ms', COALESCE(content, '')),
        ALTER COLUMN meta_title TYPE jsonb USING jsonb_build_object('en', COALESCE(meta_title, ''), 'ms', COALESCE(meta_title, '')),
        ALTER COLUMN meta_description TYPE jsonb USING jsonb_build_object('en', COALESCE(meta_description, ''), 'ms', COALESCE(meta_description, ''))
    `
    console.log('   ✓ projects migrated\n')

    // Step 6: Migrate impact_stats table
    console.log('6. Migrating impact_stats table...')
    await sql`
      ALTER TABLE impact_stats
        ALTER COLUMN label TYPE jsonb USING jsonb_build_object('en', COALESCE(label, ''), 'ms', COALESCE(label, '')),
        ALTER COLUMN suffix TYPE jsonb USING jsonb_build_object('en', COALESCE(suffix, ''), 'ms', COALESCE(suffix, ''))
    `
    console.log('   ✓ impact_stats migrated\n')

    // Step 7: Migrate faqs table
    console.log('7. Migrating faqs table...')
    await sql`
      ALTER TABLE faqs
        ALTER COLUMN question TYPE jsonb USING jsonb_build_object('en', COALESCE(question, ''), 'ms', COALESCE(question, '')),
        ALTER COLUMN answer TYPE jsonb USING jsonb_build_object('en', COALESCE(answer, ''), 'ms', COALESCE(answer, ''))
    `
    console.log('   ✓ faqs migrated\n')

    // Step 8: Migrate pages table
    console.log('8. Migrating pages table...')
    await sql`
      ALTER TABLE pages
        ALTER COLUMN title TYPE jsonb USING jsonb_build_object('en', COALESCE(title, ''), 'ms', COALESCE(title, '')),
        ALTER COLUMN meta_title TYPE jsonb USING jsonb_build_object('en', COALESCE(meta_title, ''), 'ms', COALESCE(meta_title, '')),
        ALTER COLUMN meta_description TYPE jsonb USING jsonb_build_object('en', COALESCE(meta_description, ''), 'ms', COALESCE(meta_description, ''))
    `
    console.log('   ✓ pages migrated\n')

    // Step 9: Migrate partners table
    console.log('9. Migrating partners table...')
    await sql`
      ALTER TABLE partners
        ALTER COLUMN description TYPE jsonb USING jsonb_build_object('en', COALESCE(description, ''), 'ms', COALESCE(description, ''))
    `
    console.log('   ✓ partners migrated\n')

    // Step 10: Migrate testimonials table
    console.log('10. Migrating testimonials table...')
    await sql`
      ALTER TABLE testimonials
        ALTER COLUMN content TYPE jsonb USING jsonb_build_object('en', COALESCE(content, ''), 'ms', COALESCE(content, ''))
    `
    console.log('   ✓ testimonials migrated\n')

    // Step 11: Migrate content_forms table
    console.log('11. Migrating content_forms table...')
    await sql`
      ALTER TABLE content_forms
        ALTER COLUMN title TYPE jsonb USING jsonb_build_object('en', COALESCE(title, ''), 'ms', COALESCE(title, '')),
        ALTER COLUMN description TYPE jsonb USING jsonb_build_object('en', COALESCE(description, ''), 'ms', COALESCE(description, '')),
        ALTER COLUMN submit_button_text TYPE jsonb USING jsonb_build_object('en', COALESCE(submit_button_text, 'Submit'), 'ms', COALESCE(submit_button_text, 'Hantar')),
        ALTER COLUMN success_message TYPE jsonb USING jsonb_build_object('en', COALESCE(success_message, 'Thank you for your submission!'), 'ms', COALESCE(success_message, 'Terima kasih atas penyertaan anda!'))
    `
    console.log('   ✓ content_forms migrated\n')

    console.log('═══════════════════════════════════════════════════')
    console.log('✅ All tables migrated successfully!')
    console.log('═══════════════════════════════════════════════════')
    console.log('\nNext steps:')
    console.log('1. Run "npm run db:generate" to generate Drizzle migrations')
    console.log('2. Update admin editors to use BilingualInput components')
    console.log('3. Translate existing content to Bahasa Melayu')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateToI18n()
