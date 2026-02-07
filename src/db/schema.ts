import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core'

// Type for localized content (bilingual: English and Bahasa Melayu)
// Stored as JSONB: { en: "English text", ms: "Teks Bahasa Melayu" }
export type LocalizedString = {
  en: string
  ms: string
}

// Site settings for CMS
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Hero section content (LOCALIZED)
export const heroContent = pgTable('hero_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Localized fields - stored as { en: "...", ms: "..." }
  title: jsonb('title').$type<LocalizedString>().notNull(),
  subtitle: jsonb('subtitle').$type<LocalizedString>().notNull(),
  description: jsonb('description').$type<LocalizedString>(),
  ctaText: jsonb('cta_text').$type<LocalizedString>(),
  // Non-localized fields
  ctaLink: text('cta_link'),
  backgroundImage: text('background_image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// About section (LOCALIZED)
export const aboutContent = pgTable('about_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Localized fields
  title: jsonb('title').$type<LocalizedString>().notNull(),
  content: jsonb('content').$type<LocalizedString>().notNull(),
  mission: jsonb('mission').$type<LocalizedString>(),
  vision: jsonb('vision').$type<LocalizedString>(),
  // Non-localized fields
  values: jsonb('values'), // Array of values (can be localized separately if needed)
  image: text('image'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Team members for organization chart (PARTIALLY LOCALIZED)
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // Names are usually not translated
  // Localized fields
  position: jsonb('position').$type<LocalizedString>().notNull(),
  department: text('department'),
  bio: jsonb('bio').$type<LocalizedString>(),
  // Non-localized fields
  image: text('image'),
  email: text('email'),
  phone: text('phone'),
  linkedin: text('linkedin'),
  sortOrder: integer('sort_order').default(0),
  parentId: uuid('parent_id'),
  hierarchyLevel: integer('hierarchy_level').default(0),
  isActive: boolean('is_active').default(true),
  microsoftId: text('microsoft_id'),
  microsoftSyncedAt: timestamp('microsoft_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Blog posts (LOCALIZED)
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(), // Slugs typically stay in English for SEO
  // Localized fields
  title: jsonb('title').$type<LocalizedString>().notNull(),
  excerpt: jsonb('excerpt').$type<LocalizedString>(),
  content: jsonb('content').$type<LocalizedString>().notNull(),
  metaTitle: jsonb('meta_title').$type<LocalizedString>(),
  metaDescription: jsonb('meta_description').$type<LocalizedString>(),
  // Non-localized fields
  featuredImage: text('featured_image'),
  authorId: uuid('author_id'),
  category: text('category'),
  tags: jsonb('tags'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Projects (LOCALIZED)
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  // Localized fields
  title: jsonb('title').$type<LocalizedString>().notNull(),
  subtitle: jsonb('subtitle').$type<LocalizedString>(),
  description: jsonb('description').$type<LocalizedString>().notNull(),
  content: jsonb('content').$type<LocalizedString>(),
  metaTitle: jsonb('meta_title').$type<LocalizedString>(),
  metaDescription: jsonb('meta_description').$type<LocalizedString>(),
  // Non-localized fields
  featuredImage: text('featured_image'),
  gallery: jsonb('gallery'),
  category: text('category'),
  status: text('status').default('ongoing'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: text('budget'),
  beneficiaries: integer('beneficiaries'),
  location: text('location'),
  isPublished: boolean('is_published').default(false),
  donationEnabled: boolean('donation_enabled').default(false),
  donationGoal: integer('donation_goal'),
  donationRaised: integer('donation_raised').default(0),
  toyyibpayCategoryCode: text('toyyibpay_category_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Impact statistics (LOCALIZED)
export const impactStats = pgTable('impact_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Localized fields
  label: jsonb('label').$type<LocalizedString>().notNull(),
  suffix: jsonb('suffix').$type<LocalizedString>(),
  // Non-localized fields
  value: text('value').notNull(), // Numbers don't need translation
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Donations (NOT LOCALIZED - transactional data)
export const donations = pgTable('donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  donorName: text('donor_name'),
  donorEmail: text('donor_email'),
  donorPhone: text('donor_phone'),
  amount: integer('amount').notNull(),
  currency: text('currency').default('MYR'),
  projectId: uuid('project_id'),
  message: text('message'),
  isAnonymous: boolean('is_anonymous').default(false),
  paymentStatus: text('payment_status').default('pending'),
  paymentReference: text('payment_reference'),
  toyyibpayBillCode: text('toyyibpay_bill_code'),
  toyyibpayTransactionId: text('toyyibpay_transaction_id'),
  paymentMethod: text('payment_method').default('fpx'),
  paymentAttempts: integer('payment_attempts').default(0),
  environment: text('environment').default('production'),
  receiptSentAt: timestamp('receipt_sent_at'),
  receiptNumber: text('receipt_number'),
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  failureReason: text('failure_reason'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Donation Logs (NOT LOCALIZED - audit data)
export const donationLogs = pgTable('donation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  donationId: uuid('donation_id').notNull(),
  eventType: text('event_type').notNull(),
  eventData: jsonb('event_data'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Contact form submissions (NOT LOCALIZED - user submissions)
export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Partners/Sponsors (PARTIALLY LOCALIZED)
export const partners = pgTable('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  website: text('website'),
  // Localized field
  description: jsonb('description').$type<LocalizedString>(),
  // Non-localized fields
  tier: text('tier').default('partner'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Testimonials (LOCALIZED)
export const testimonials = pgTable('testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  position: text('position'),
  organization: text('organization'),
  // Localized field
  content: jsonb('content').$type<LocalizedString>().notNull(),
  // Non-localized fields
  image: text('image'),
  rating: integer('rating').default(5),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Admin users (NOT LOCALIZED - system data)
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').default('editor'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// FAQ (LOCALIZED)
export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Localized fields
  question: jsonb('question').$type<LocalizedString>().notNull(),
  answer: jsonb('answer').$type<LocalizedString>().notNull(),
  // Non-localized fields
  category: text('category'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Pages for dynamic SEO (LOCALIZED)
export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  // Localized fields
  title: jsonb('title').$type<LocalizedString>().notNull(),
  metaTitle: jsonb('meta_title').$type<LocalizedString>(),
  metaDescription: jsonb('meta_description').$type<LocalizedString>(),
  // Non-localized fields
  ogImage: text('og_image'),
  content: jsonb('content'),
  isPublished: boolean('is_published').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content version history (NOT LOCALIZED - system data)
export const contentVersions = pgTable('content_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentType: text('content_type').notNull(),
  contentId: uuid('content_id').notNull(),
  versionNumber: integer('version_number').notNull().default(1),
  data: jsonb('data').notNull(),
  changeType: text('change_type').notNull(),
  changeSummary: text('change_summary'),
  changedFields: jsonb('changed_fields'),
  changedBy: uuid('changed_by'),
  changedByEmail: text('changed_by_email'),
  changedByName: text('changed_by_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Activity log (NOT LOCALIZED - system data)
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  eventDescription: text('event_description').notNull(),
  contentType: text('content_type'),
  contentId: uuid('content_id'),
  contentTitle: text('content_title'),
  userId: uuid('user_id'),
  userEmail: text('user_email'),
  userName: text('user_name'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Content Forms (LOCALIZED)
export const contentForms = pgTable('content_forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  // Localized fields
  title: jsonb('title').$type<LocalizedString>(),
  description: jsonb('description').$type<LocalizedString>(),
  submitButtonText: jsonb('submit_button_text').$type<LocalizedString>(),
  successMessage: jsonb('success_message').$type<LocalizedString>(),
  // Non-localized fields
  fields: jsonb('fields').notNull().default('[]'),
  sendEmailNotification: boolean('send_email_notification').default(true),
  notificationEmail: text('notification_email'),
  isActive: boolean('is_active').default(true),
  linkedContentType: text('linked_content_type'),
  linkedContentId: uuid('linked_content_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Form Submissions (NOT LOCALIZED - user submissions)
export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull(),
  formSlug: text('form_slug').notNull(),
  data: jsonb('data').notNull(),
  sourceUrl: text('source_url'),
  sourceContentType: text('source_content_type'),
  sourceContentId: uuid('source_content_id'),
  sourceContentTitle: text('source_content_title'),
  submitterEmail: text('submitter_email'),
  submitterName: text('submitter_name'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Admin Notifications (NOT LOCALIZED - system data)
export const adminNotifications = pgTable('admin_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  priority: text('priority').default('normal'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  icon: text('icon'),
  relatedType: text('related_type'),
  relatedId: uuid('related_id'),
  relatedUrl: text('related_url'),
  metadata: jsonb('metadata'),
  isRead: boolean('is_read').default(false),
  isDismissed: boolean('is_dismissed').default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
})

// Team Member Reporting Relationships (for multiple managers)
// This table enables a team member to report to multiple managers
export const teamMemberReports = pgTable('team_member_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: uuid('member_id').notNull(), // The team member who reports
  managerId: uuid('manager_id').notNull(), // The manager they report to
  isPrimary: boolean('is_primary').default(false), // Is this the primary reporting relationship?
  reportType: text('report_type').default('direct'), // 'direct', 'dotted', 'functional', 'project'
  notes: text('notes'), // Optional notes about the relationship
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// TRANSLATION SYSTEM
// ============================================

// Translation Feedback - Allows admins to flag and correct translations
export const translationFeedback = pgTable('translation_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentType: text('content_type').notNull(), // 'blog_posts', 'projects', 'team_members', etc.
  contentId: uuid('content_id').notNull(), // ID of the content being translated
  field: text('field').notNull(), // 'title', 'content', 'description', etc.
  sourceLanguage: text('source_language').notNull(), // 'en' or 'ms'
  targetLanguage: text('target_language').notNull(), // 'en' or 'ms'
  originalText: text('original_text').notNull(), // The source text that was translated
  translatedText: text('translated_text').notNull(), // The auto-generated translation
  correctedText: text('corrected_text'), // Admin-provided correction
  feedbackType: text('feedback_type').notNull(), // 'incorrect', 'awkward', 'context_missing', 'grammar'
  notes: text('notes'), // Additional context or explanation
  status: text('status').default('pending'), // 'pending', 'reviewed', 'applied', 'dismissed'
  submittedBy: uuid('submitted_by'),
  submittedByEmail: text('submitted_by_email'),
  submittedByName: text('submitted_by_name'),
  reviewedBy: uuid('reviewed_by'),
  reviewedByEmail: text('reviewed_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
})

// Translation Glossary - Custom terminology for consistent translations
export const translationGlossary = pgTable('translation_glossary', {
  id: uuid('id').defaultRandom().primaryKey(),
  termEn: text('term_en').notNull(), // English term
  termMs: text('term_ms').notNull(), // Malay translation
  context: text('context'), // 'general', 'donation', 'project', 'about', etc.
  notes: text('notes'), // Usage notes or examples
  caseSensitive: boolean('case_sensitive').default(false),
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by'),
  createdByEmail: text('created_by_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
