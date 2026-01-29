import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core'

// Site settings for CMS
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Hero section content
export const heroContent = pgTable('hero_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description'),
  ctaText: text('cta_text'),
  ctaLink: text('cta_link'),
  backgroundImage: text('background_image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// About section
export const aboutContent = pgTable('about_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mission: text('mission'),
  vision: text('vision'),
  values: jsonb('values'),
  image: text('image'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Team members for organization chart
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  department: text('department'),
  bio: text('bio'),
  image: text('image'),
  email: text('email'),
  phone: text('phone'),
  linkedin: text('linkedin'),
  sortOrder: integer('sort_order').default(0),
  parentId: uuid('parent_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Blog posts
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  authorId: uuid('author_id'),
  category: text('category'),
  tags: jsonb('tags'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description').notNull(),
  content: text('content'),
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
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Impact statistics
export const impactStats = pgTable('impact_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  suffix: text('suffix'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Donations
export const donations = pgTable('donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  donorName: text('donor_name'),
  donorEmail: text('donor_email'),
  amount: integer('amount').notNull(),
  currency: text('currency').default('MYR'),
  projectId: uuid('project_id'),
  message: text('message'),
  isAnonymous: boolean('is_anonymous').default(false),
  paymentStatus: text('payment_status').default('pending'),
  paymentReference: text('payment_reference'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Contact form submissions
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

// Partners/Sponsors
export const partners = pgTable('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  website: text('website'),
  description: text('description'),
  tier: text('tier').default('partner'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Testimonials
export const testimonials = pgTable('testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  position: text('position'),
  organization: text('organization'),
  content: text('content').notNull(),
  image: text('image'),
  rating: integer('rating').default(5),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Admin users
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').default('editor'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// FAQ
export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Pages for dynamic SEO
export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  content: jsonb('content'),
  isPublished: boolean('is_published').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content version history for audit trail and restoration
export const contentVersions = pgTable('content_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Content identification
  contentType: text('content_type').notNull(), // 'blog_posts', 'projects', 'team_members', etc.
  contentId: uuid('content_id').notNull(), // ID of the original content
  // Version info
  versionNumber: integer('version_number').notNull().default(1),
  // Full snapshot of the content at this version
  data: jsonb('data').notNull(),
  // Change metadata
  changeType: text('change_type').notNull(), // 'create', 'update', 'delete', 'restore', 'publish', 'unpublish'
  changeSummary: text('change_summary'), // Optional description of what changed
  changedFields: jsonb('changed_fields'), // Array of field names that changed
  // User tracking
  changedBy: uuid('changed_by'), // Admin user ID who made the change
  changedByEmail: text('changed_by_email'), // Email for display (in case user is deleted)
  changedByName: text('changed_by_name'), // Name for display
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Activity log for general system events
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Event details
  eventType: text('event_type').notNull(), // 'login', 'logout', 'content_create', 'content_update', 'content_delete', 'content_restore', 'settings_change'
  eventDescription: text('event_description').notNull(),
  // Related entities
  contentType: text('content_type'), // Optional: which content type was affected
  contentId: uuid('content_id'), // Optional: which content item was affected
  contentTitle: text('content_title'), // Store title for easy display
  // User info
  userId: uuid('user_id'),
  userEmail: text('user_email'),
  userName: text('user_name'),
  // Request metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  // Additional data
  metadata: jsonb('metadata'), // Any extra data about the event
  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
