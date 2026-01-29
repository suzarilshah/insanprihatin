import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Seed Admin User
    console.log('Creating admin user...')
    await db.insert(schema.adminUsers).values({
      email: 'admin@insanprihatin.org',
      name: 'System Administrator',
      role: 'admin',
      isActive: true,
    }).onConflictDoNothing()

    // Seed Hero Content
    console.log('Creating hero content...')
    await db.insert(schema.heroContent).values({
      title: 'Empowering Communities Through Compassion',
      subtitle: 'Yayasan Insan Prihatin',
      description: 'Building a better tomorrow through education, healthcare, and sustainable development. Join us in creating lasting impact for communities across Malaysia.',
      ctaText: 'Explore Our Impact',
      ctaLink: '/projects',
      isActive: true,
    }).onConflictDoNothing()

    // Seed About Content
    console.log('Creating about content...')
    await db.insert(schema.aboutContent).values({
      title: 'About Yayasan Insan Prihatin',
      content: 'For over a decade, Yayasan Insan Prihatin has been at the forefront of community service, creating sustainable impact through education, healthcare, and development programs across Malaysia.',
      mission: 'To empower underprivileged communities through sustainable programs in education, healthcare, and economic development, creating lasting positive change across Malaysia.',
      vision: 'A Malaysia where every individual has equal opportunities to thrive, contribute to society, and live with dignity regardless of their background or circumstances.',
      values: ['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation'],
    }).onConflictDoNothing()

    // Seed Impact Stats
    console.log('Creating impact stats...')
    const stats = [
      { label: 'Lives Impacted', value: '50,000', suffix: '+', icon: 'users', sortOrder: 1 },
      { label: 'Funds Channeled', value: 'RM 15', suffix: 'M', icon: 'currency', sortOrder: 2 },
      { label: 'Projects Completed', value: '120', suffix: '+', icon: 'projects', sortOrder: 3 },
      { label: 'States Covered', value: '13', suffix: '', icon: 'map', sortOrder: 4 },
    ]

    for (const stat of stats) {
      await db.insert(schema.impactStats).values({
        ...stat,
        isActive: true,
      }).onConflictDoNothing()
    }

    // Seed Team Members
    console.log('Creating team members...')
    const team = [
      { name: "Dato' Ahmad Rahman", position: 'Chairman', department: 'Board of Trustees', sortOrder: 1 },
      { name: 'Puan Sri Fatimah Hassan', position: 'Deputy Chairman', department: 'Board of Trustees', sortOrder: 2 },
      { name: 'Dr. Lee Wei Ming', position: 'Chief Executive Officer', department: 'Executive Leadership', sortOrder: 3 },
      { name: 'Encik Mohd Azlan', position: 'Chief Operating Officer', department: 'Executive Leadership', sortOrder: 4 },
      { name: 'Cik Nurul Aisyah', position: 'Director of Programs', department: 'Program Management', sortOrder: 5 },
      { name: 'Mr. Rajesh Kumar', position: 'Director of Finance', department: 'Finance & Administration', sortOrder: 6 },
      { name: 'Puan Siti Aminah', position: 'Director of Communications', department: 'Communications & PR', sortOrder: 7 },
      { name: 'Encik Abdullah Ibrahim', position: 'Director of Partnerships', department: 'Strategic Partnerships', sortOrder: 8 },
    ]

    for (const member of team) {
      await db.insert(schema.teamMembers).values({
        ...member,
        isActive: true,
      }).onConflictDoNothing()
    }

    // Seed FAQs
    console.log('Creating FAQs...')
    const faqs = [
      {
        question: 'How can I donate to Yayasan Insan Prihatin?',
        answer: 'You can donate through our website, bank transfer, or by visiting our office. All donations are tax-deductible under Section 44(6) of the Income Tax Act 1967.',
        category: 'donations',
        sortOrder: 1,
      },
      {
        question: 'Can I volunteer with your organization?',
        answer: 'Yes! We welcome volunteers for various programs including education, community outreach, and events. Please fill out the contact form with "Volunteering" as the subject.',
        category: 'volunteering',
        sortOrder: 2,
      },
      {
        question: 'How do I apply for assistance from your programs?',
        answer: 'Please contact us with details about your situation. Our team will guide you through the application process and determine which programs you may be eligible for.',
        category: 'programs',
        sortOrder: 3,
      },
      {
        question: 'Do you accept corporate partnerships?',
        answer: 'Absolutely! We actively seek partnerships with corporations for CSR initiatives. We offer various partnership tiers and can customize programs to align with your corporate values.',
        category: 'partnerships',
        sortOrder: 4,
      },
      {
        question: 'Is my donation tax-deductible?',
        answer: 'Yes, Yayasan Insan Prihatin is a registered charity. All donations are tax-deductible, and we provide official receipts for tax purposes.',
        category: 'donations',
        sortOrder: 5,
      },
    ]

    for (const faq of faqs) {
      await db.insert(schema.faqs).values({
        ...faq,
        isActive: true,
      }).onConflictDoNothing()
    }

    // Seed Sample Projects
    console.log('Creating sample projects...')
    const projects = [
      {
        slug: 'scholarship-program-2024',
        title: 'Scholarship Program 2024',
        subtitle: 'Empowering Future Leaders',
        description: 'Providing full scholarships to 500 underprivileged students pursuing higher education across Malaysian universities.',
        category: 'education',
        status: 'ongoing',
        beneficiaries: 500,
        location: 'Nationwide',
        isPublished: true,
      },
      {
        slug: 'rural-health-camps',
        title: 'Rural Health Camps',
        subtitle: 'Healthcare for All',
        description: 'Mobile medical camps bringing healthcare services to remote communities in East Malaysia with free consultations and medicine.',
        category: 'healthcare',
        status: 'ongoing',
        beneficiaries: 3000,
        location: 'Sabah & Sarawak',
        isPublished: true,
      },
      {
        slug: 'green-malaysia-initiative',
        title: 'Green Malaysia Initiative',
        subtitle: 'Planting for Tomorrow',
        description: 'Community-driven tree planting and environmental conservation program targeting 100,000 trees across Peninsular Malaysia.',
        category: 'environment',
        status: 'completed',
        beneficiaries: 10000,
        location: 'Peninsular Malaysia',
        isPublished: true,
      },
    ]

    for (const project of projects) {
      await db.insert(schema.projects).values(project).onConflictDoNothing()
    }

    // Seed Sample Blog Posts
    console.log('Creating sample blog posts...')
    const posts = [
      {
        slug: 'annual-report-2025',
        title: 'Yayasan Insan Prihatin Releases 2025 Annual Report',
        excerpt: 'Our comprehensive report showcases the remarkable impact achieved across all programs.',
        content: 'We are pleased to announce the release of our 2025 Annual Report...',
        category: 'announcements',
        isPublished: true,
        publishedAt: new Date('2026-01-15'),
      },
      {
        slug: 'scholarship-success-stories',
        title: 'From Struggle to Success: How Scholarships Changed Their Lives',
        excerpt: 'Meet three scholarship recipients who have overcome adversity to achieve academic excellence.',
        content: 'Education is the most powerful weapon which you can use to change the world...',
        category: 'stories',
        isPublished: true,
        publishedAt: new Date('2026-01-10'),
      },
    ]

    for (const post of posts) {
      await db.insert(schema.blogPosts).values(post).onConflictDoNothing()
    }

    // Seed Pages for SEO
    console.log('Creating page SEO entries...')
    const pagesList = [
      { slug: 'home', title: 'Home', metaTitle: 'Yayasan Insan Prihatin | Empowering Communities Through Compassion', metaDescription: 'A prestigious Malaysian foundation dedicated to community service, education, and sustainable development.' },
      { slug: 'about', title: 'About Us', metaTitle: 'About Us | Yayasan Insan Prihatin', metaDescription: 'Learn about our mission, vision, and the team behind Yayasan Insan Prihatin.' },
      { slug: 'projects', title: 'Projects', metaTitle: 'Our Projects | Yayasan Insan Prihatin', metaDescription: 'Explore our ongoing and completed projects creating lasting impact across Malaysia.' },
      { slug: 'blog', title: 'Blog', metaTitle: 'Blog & News | Yayasan Insan Prihatin', metaDescription: 'Stay updated with the latest news, stories, and events from Yayasan Insan Prihatin.' },
      { slug: 'contact', title: 'Contact', metaTitle: 'Contact Us | Yayasan Insan Prihatin', metaDescription: 'Get in touch with us. We would love to hear from you.' },
      { slug: 'donate', title: 'Donate', metaTitle: 'Donate | Yayasan Insan Prihatin', metaDescription: 'Support our mission. Your donation helps transform lives across Malaysia.' },
    ]

    for (const page of pagesList) {
      await db.insert(schema.pages).values({
        ...page,
        isPublished: true,
      }).onConflictDoNothing()
    }

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  }
}

seed()
