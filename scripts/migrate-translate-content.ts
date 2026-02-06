/**
 * Migration Script: Translate All Existing Content
 *
 * This script will:
 * 1. Fetch all blog posts and projects from the database
 * 2. Check which fields are missing translations
 * 3. Auto-translate the missing language using Azure Translator
 * 4. Update the database with translated content
 *
 * Run with: npx tsx scripts/migrate-translate-content.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema'

// Azure Translator configuration
const AZURE_TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com/'
const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

if (!AZURE_TRANSLATOR_KEY) {
  console.error('❌ AZURE_TRANSLATOR_KEY is not configured')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not configured')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

type LocalizedString = { en: string; ms: string }

// Translate text using Azure API
async function translateText(text: string, targetLang: 'en' | 'ms', sourceLang: 'en' | 'ms'): Promise<string> {
  if (!text || text.trim().length === 0) return ''

  const url = new URL('/translate', AZURE_TRANSLATOR_ENDPOINT)
  url.searchParams.append('api-version', '3.0')
  url.searchParams.append('to', targetLang)
  url.searchParams.append('from', sourceLang)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY!,
      'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ text }]),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Translation failed: ${response.status}`)
  }

  const data = await response.json()
  return data[0].translations[0].text
}

// Check and translate a localized field
async function translateField(
  field: LocalizedString | string | null | undefined,
  fieldName: string
): Promise<LocalizedString | null> {
  if (!field) return null

  // Handle string fields (legacy data)
  if (typeof field === 'string') {
    if (!field.trim()) return { en: '', ms: '' }
    console.log(`    📝 ${fieldName}: Converting string to bilingual...`)
    const translated = await translateText(field, 'ms', 'en')
    return { en: field, ms: translated }
  }

  const hasEn = field.en && field.en.trim().length > 0
  const hasMs = field.ms && field.ms.trim().length > 0

  // Both filled - no translation needed
  if (hasEn && hasMs) {
    return null // No change needed
  }

  // Neither filled
  if (!hasEn && !hasMs) {
    return null
  }

  // Translate missing language
  if (hasEn && !hasMs) {
    console.log(`    📝 ${fieldName}: Translating EN → MS...`)
    const translated = await translateText(field.en, 'ms', 'en')
    return { en: field.en, ms: translated }
  }

  if (hasMs && !hasEn) {
    console.log(`    📝 ${fieldName}: Translating MS → EN...`)
    const translated = await translateText(field.ms, 'en', 'ms')
    return { en: translated, ms: field.ms }
  }

  return null
}

// Add delay between API calls to avoid rate limiting
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function migrateBlogPosts() {
  console.log('\n📰 Migrating Blog Posts...')

  const posts = await db.query.blogPosts.findMany()
  console.log(`   Found ${posts.length} blog posts`)

  let updated = 0
  for (const post of posts) {
    console.log(`\n   Processing: ${typeof post.title === 'string' ? post.title : post.title?.en || 'Untitled'}`)

    const updates: Record<string, LocalizedString> = {}

    // Check each localized field
    const titleTranslation = await translateField(post.title as LocalizedString, 'title')
    if (titleTranslation) updates.title = titleTranslation
    await delay(100)

    const excerptTranslation = await translateField(post.excerpt as LocalizedString | null, 'excerpt')
    if (excerptTranslation) updates.excerpt = excerptTranslation
    await delay(100)

    const contentTranslation = await translateField(post.content as LocalizedString, 'content')
    if (contentTranslation) updates.content = contentTranslation
    await delay(100)

    const metaTitleTranslation = await translateField(post.metaTitle as LocalizedString | null, 'metaTitle')
    if (metaTitleTranslation) updates.metaTitle = metaTitleTranslation
    await delay(100)

    const metaDescTranslation = await translateField(post.metaDescription as LocalizedString | null, 'metaDescription')
    if (metaDescTranslation) updates.metaDescription = metaDescTranslation
    await delay(100)

    // Update if there are changes
    if (Object.keys(updates).length > 0) {
      await db.update(schema.blogPosts)
        .set(updates)
        .where(eq(schema.blogPosts.id, post.id))
      updated++
      console.log(`   ✅ Updated blog post: ${post.slug}`)
    } else {
      console.log(`   ⏭️  No translation needed`)
    }
  }

  console.log(`\n   📰 Blog Posts: ${updated}/${posts.length} updated`)
  return updated
}

async function migrateProjects() {
  console.log('\n🚀 Migrating Projects...')

  const projectList = await db.query.projects.findMany()
  console.log(`   Found ${projectList.length} projects`)

  let updated = 0
  for (const project of projectList) {
    console.log(`\n   Processing: ${typeof project.title === 'string' ? project.title : project.title?.en || 'Untitled'}`)

    const updates: Record<string, LocalizedString> = {}

    // Check each localized field
    const titleTranslation = await translateField(project.title as LocalizedString, 'title')
    if (titleTranslation) updates.title = titleTranslation
    await delay(100)

    const subtitleTranslation = await translateField(project.subtitle as LocalizedString | null, 'subtitle')
    if (subtitleTranslation) updates.subtitle = subtitleTranslation
    await delay(100)

    const descTranslation = await translateField(project.description as LocalizedString, 'description')
    if (descTranslation) updates.description = descTranslation
    await delay(100)

    const contentTranslation = await translateField(project.content as LocalizedString | null, 'content')
    if (contentTranslation) updates.content = contentTranslation
    await delay(100)

    const metaTitleTranslation = await translateField(project.metaTitle as LocalizedString | null, 'metaTitle')
    if (metaTitleTranslation) updates.metaTitle = metaTitleTranslation
    await delay(100)

    const metaDescTranslation = await translateField(project.metaDescription as LocalizedString | null, 'metaDescription')
    if (metaDescTranslation) updates.metaDescription = metaDescTranslation
    await delay(100)

    // Update if there are changes
    if (Object.keys(updates).length > 0) {
      await db.update(schema.projects)
        .set(updates)
        .where(eq(schema.projects.id, project.id))
      updated++
      console.log(`   ✅ Updated project: ${project.slug}`)
    } else {
      console.log(`   ⏭️  No translation needed`)
    }
  }

  console.log(`\n   🚀 Projects: ${updated}/${projectList.length} updated`)
  return updated
}

async function migrateHeroContent() {
  console.log('\n🎯 Migrating Hero Content...')

  const heroes = await db.query.heroContent.findMany()
  console.log(`   Found ${heroes.length} hero sections`)

  let updated = 0
  for (const hero of heroes) {
    const updates: Record<string, LocalizedString> = {}

    const titleTranslation = await translateField(hero.title as LocalizedString, 'title')
    if (titleTranslation) updates.title = titleTranslation
    await delay(100)

    const subtitleTranslation = await translateField(hero.subtitle as LocalizedString, 'subtitle')
    if (subtitleTranslation) updates.subtitle = subtitleTranslation
    await delay(100)

    const descTranslation = await translateField(hero.description as LocalizedString | null, 'description')
    if (descTranslation) updates.description = descTranslation
    await delay(100)

    const ctaTranslation = await translateField(hero.ctaText as LocalizedString | null, 'ctaText')
    if (ctaTranslation) updates.ctaText = ctaTranslation
    await delay(100)

    if (Object.keys(updates).length > 0) {
      await db.update(schema.heroContent)
        .set(updates)
        .where(eq(schema.heroContent.id, hero.id))
      updated++
      console.log(`   ✅ Updated hero section`)
    }
  }

  console.log(`\n   🎯 Hero Content: ${updated}/${heroes.length} updated`)
  return updated
}

async function migrateAboutContent() {
  console.log('\n📖 Migrating About Content...')

  const aboutList = await db.query.aboutContent.findMany()
  console.log(`   Found ${aboutList.length} about sections`)

  let updated = 0
  for (const about of aboutList) {
    const updates: Record<string, LocalizedString> = {}

    const titleTranslation = await translateField(about.title as LocalizedString, 'title')
    if (titleTranslation) updates.title = titleTranslation
    await delay(100)

    const contentTranslation = await translateField(about.content as LocalizedString, 'content')
    if (contentTranslation) updates.content = contentTranslation
    await delay(100)

    const missionTranslation = await translateField(about.mission as LocalizedString | null, 'mission')
    if (missionTranslation) updates.mission = missionTranslation
    await delay(100)

    const visionTranslation = await translateField(about.vision as LocalizedString | null, 'vision')
    if (visionTranslation) updates.vision = visionTranslation
    await delay(100)

    if (Object.keys(updates).length > 0) {
      await db.update(schema.aboutContent)
        .set(updates)
        .where(eq(schema.aboutContent.id, about.id))
      updated++
      console.log(`   ✅ Updated about section`)
    }
  }

  console.log(`\n   📖 About Content: ${updated}/${aboutList.length} updated`)
  return updated
}

async function migrateFAQs() {
  console.log('\n❓ Migrating FAQs...')

  const faqList = await db.query.faqs.findMany()
  console.log(`   Found ${faqList.length} FAQs`)

  let updated = 0
  for (const faq of faqList) {
    const updates: Record<string, LocalizedString> = {}

    const questionTranslation = await translateField(faq.question as LocalizedString, 'question')
    if (questionTranslation) updates.question = questionTranslation
    await delay(100)

    const answerTranslation = await translateField(faq.answer as LocalizedString, 'answer')
    if (answerTranslation) updates.answer = answerTranslation
    await delay(100)

    if (Object.keys(updates).length > 0) {
      await db.update(schema.faqs)
        .set(updates)
        .where(eq(schema.faqs.id, faq.id))
      updated++
      console.log(`   ✅ Updated FAQ`)
    }
  }

  console.log(`\n   ❓ FAQs: ${updated}/${faqList.length} updated`)
  return updated
}

async function main() {
  console.log('🌐 Starting Content Translation Migration')
  console.log('=========================================')
  console.log(`Using Azure Translator (Region: ${AZURE_TRANSLATOR_REGION})`)
  console.log('')

  try {
    const blogUpdates = await migrateBlogPosts()
    const projectUpdates = await migrateProjects()
    const heroUpdates = await migrateHeroContent()
    const aboutUpdates = await migrateAboutContent()
    const faqUpdates = await migrateFAQs()

    console.log('\n=========================================')
    console.log('✅ Migration Complete!')
    console.log(`   Blog Posts: ${blogUpdates} updated`)
    console.log(`   Projects: ${projectUpdates} updated`)
    console.log(`   Hero Content: ${heroUpdates} updated`)
    console.log(`   About Content: ${aboutUpdates} updated`)
    console.log(`   FAQs: ${faqUpdates} updated`)
    console.log('=========================================\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
