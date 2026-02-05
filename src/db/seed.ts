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
      title: { en: 'Empowering Communities Through Compassion', ms: 'Memperkasa Komuniti Melalui Belas Kasihan' },
      subtitle: { en: 'Yayasan Insan Prihatin', ms: 'Yayasan Insan Prihatin' },
      description: { en: 'Building a better tomorrow through education, healthcare, and sustainable development. Join us in creating lasting impact for communities across Malaysia.', ms: 'Membina masa depan yang lebih baik melalui pendidikan, penjagaan kesihatan, dan pembangunan mampan. Sertai kami dalam mencipta impak berpanjangan untuk komuniti di seluruh Malaysia.' },
      ctaText: { en: 'Explore Our Impact', ms: 'Terokai Impak Kami' },
      ctaLink: '/projects',
      isActive: true,
    }).onConflictDoNothing()

    // Seed About Content
    console.log('Creating about content...')
    await db.insert(schema.aboutContent).values({
      title: { en: 'About Yayasan Insan Prihatin', ms: 'Tentang Yayasan Insan Prihatin' },
      content: { en: 'For over a decade, Yayasan Insan Prihatin has been at the forefront of community service, creating sustainable impact through education, healthcare, and development programs across Malaysia.', ms: 'Selama lebih sedekad, Yayasan Insan Prihatin telah berada di barisan hadapan perkhidmatan komuniti, mencipta impak mampan melalui program pendidikan, penjagaan kesihatan, dan pembangunan di seluruh Malaysia.' },
      mission: { en: 'To empower underprivileged communities through sustainable programs in education, healthcare, and economic development, creating lasting positive change across Malaysia.', ms: 'Untuk memperkasa komuniti kurang bernasib baik melalui program mampan dalam pendidikan, penjagaan kesihatan, dan pembangunan ekonomi, mencipta perubahan positif berpanjangan di seluruh Malaysia.' },
      vision: { en: 'A Malaysia where every individual has equal opportunities to thrive, contribute to society, and live with dignity regardless of their background or circumstances.', ms: 'Malaysia di mana setiap individu mempunyai peluang yang sama untuk berkembang maju, menyumbang kepada masyarakat, dan hidup dengan bermaruah tanpa mengira latar belakang atau keadaan mereka.' },
      values: ['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation'],
    }).onConflictDoNothing()

    // Seed Impact Stats
    console.log('Creating impact stats...')
    const stats = [
      { label: { en: 'Lives Impacted', ms: 'Nyawa Dibantu' }, value: '50,000', suffix: { en: '+', ms: '+' }, icon: 'users', sortOrder: 1 },
      { label: { en: 'Funds Channeled', ms: 'Dana Disalurkan' }, value: 'RM 15', suffix: { en: 'M', ms: 'J' }, icon: 'currency', sortOrder: 2 },
      { label: { en: 'Projects Completed', ms: 'Projek Selesai' }, value: '120', suffix: { en: '+', ms: '+' }, icon: 'projects', sortOrder: 3 },
      { label: { en: 'States Covered', ms: 'Negeri Diliputi' }, value: '13', suffix: { en: '', ms: '' }, icon: 'map', sortOrder: 4 },
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
      { name: "Dato' Ahmad Rahman", position: { en: 'Chairman', ms: 'Pengerusi' }, department: 'Board of Trustees', sortOrder: 1 },
      { name: 'Puan Sri Fatimah Hassan', position: { en: 'Deputy Chairman', ms: 'Timbalan Pengerusi' }, department: 'Board of Trustees', sortOrder: 2 },
      { name: 'Dr. Lee Wei Ming', position: { en: 'Chief Executive Officer', ms: 'Ketua Pegawai Eksekutif' }, department: 'Executive Leadership', sortOrder: 3 },
      { name: 'Encik Mohd Azlan', position: { en: 'Chief Operating Officer', ms: 'Ketua Pegawai Operasi' }, department: 'Executive Leadership', sortOrder: 4 },
      { name: 'Cik Nurul Aisyah', position: { en: 'Director of Programs', ms: 'Pengarah Program' }, department: 'Program Management', sortOrder: 5 },
      { name: 'Mr. Rajesh Kumar', position: { en: 'Director of Finance', ms: 'Pengarah Kewangan' }, department: 'Finance & Administration', sortOrder: 6 },
      { name: 'Puan Siti Aminah', position: { en: 'Director of Communications', ms: 'Pengarah Komunikasi' }, department: 'Communications & PR', sortOrder: 7 },
      { name: 'Encik Abdullah Ibrahim', position: { en: 'Director of Partnerships', ms: 'Pengarah Perkongsian' }, department: 'Strategic Partnerships', sortOrder: 8 },
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
        question: { en: 'How can I donate to Yayasan Insan Prihatin?', ms: 'Bagaimana saya boleh menderma kepada Yayasan Insan Prihatin?' },
        answer: { en: 'You can donate through our website, bank transfer, or by visiting our office. All donations are tax-deductible under Section 44(6) of the Income Tax Act 1967.', ms: 'Anda boleh menderma melalui laman web kami, pindahan bank, atau dengan mengunjungi pejabat kami. Semua derma boleh ditolak cukai di bawah Seksyen 44(6) Akta Cukai Pendapatan 1967.' },
        category: 'donations',
        sortOrder: 1,
      },
      {
        question: { en: 'Can I volunteer with your organization?', ms: 'Bolehkah saya menjadi sukarelawan dengan organisasi anda?' },
        answer: { en: 'Yes! We welcome volunteers for various programs including education, community outreach, and events. Please fill out the contact form with "Volunteering" as the subject.', ms: 'Ya! Kami mengalu-alukan sukarelawan untuk pelbagai program termasuk pendidikan, jangkauan komuniti, dan acara. Sila isi borang hubungi dengan "Sukarelawan" sebagai subjek.' },
        category: 'volunteering',
        sortOrder: 2,
      },
      {
        question: { en: 'How do I apply for assistance from your programs?', ms: 'Bagaimana saya memohon bantuan daripada program anda?' },
        answer: { en: 'Please contact us with details about your situation. Our team will guide you through the application process and determine which programs you may be eligible for.', ms: 'Sila hubungi kami dengan butiran tentang keadaan anda. Pasukan kami akan membimbing anda melalui proses permohonan dan menentukan program mana yang anda layak.' },
        category: 'programs',
        sortOrder: 3,
      },
      {
        question: { en: 'Do you accept corporate partnerships?', ms: 'Adakah anda menerima perkongsian korporat?' },
        answer: { en: 'Absolutely! We actively seek partnerships with corporations for CSR initiatives. We offer various partnership tiers and can customize programs to align with your corporate values.', ms: 'Sudah tentu! Kami secara aktif mencari perkongsian dengan syarikat untuk inisiatif CSR. Kami menawarkan pelbagai tahap perkongsian dan boleh menyesuaikan program untuk selaras dengan nilai korporat anda.' },
        category: 'partnerships',
        sortOrder: 4,
      },
      {
        question: { en: 'Is my donation tax-deductible?', ms: 'Adakah derma saya boleh ditolak cukai?' },
        answer: { en: 'Yes, Yayasan Insan Prihatin is a registered charity. All donations are tax-deductible, and we provide official receipts for tax purposes.', ms: 'Ya, Yayasan Insan Prihatin adalah badan amal berdaftar. Semua derma boleh ditolak cukai, dan kami menyediakan resit rasmi untuk tujuan cukai.' },
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
        title: { en: 'Scholarship Program 2024', ms: 'Program Biasiswa 2024' },
        subtitle: { en: 'Empowering Future Leaders', ms: 'Memperkasa Pemimpin Masa Depan' },
        description: { en: 'Providing full scholarships to 500 underprivileged students pursuing higher education across Malaysian universities.', ms: 'Menyediakan biasiswa penuh kepada 500 pelajar kurang bernasib baik yang melanjutkan pengajian tinggi di universiti Malaysia.' },
        category: 'education',
        status: 'ongoing',
        beneficiaries: 500,
        location: 'Nationwide',
        isPublished: true,
      },
      {
        slug: 'rural-health-camps',
        title: { en: 'Rural Health Camps', ms: 'Kem Kesihatan Luar Bandar' },
        subtitle: { en: 'Healthcare for All', ms: 'Penjagaan Kesihatan untuk Semua' },
        description: { en: 'Mobile medical camps bringing healthcare services to remote communities in East Malaysia with free consultations and medicine.', ms: 'Kem perubatan bergerak membawa perkhidmatan kesihatan ke komuniti terpencil di Malaysia Timur dengan konsultasi dan ubat percuma.' },
        category: 'healthcare',
        status: 'ongoing',
        beneficiaries: 3000,
        location: 'Sabah & Sarawak',
        isPublished: true,
      },
      {
        slug: 'green-malaysia-initiative',
        title: { en: 'Green Malaysia Initiative', ms: 'Inisiatif Malaysia Hijau' },
        subtitle: { en: 'Planting for Tomorrow', ms: 'Menanam untuk Hari Esok' },
        description: { en: 'Community-driven tree planting and environmental conservation program targeting 100,000 trees across Peninsular Malaysia.', ms: 'Program penanaman pokok dan pemuliharaan alam sekitar dipacu komuniti yang menyasarkan 100,000 pokok di seluruh Semenanjung Malaysia.' },
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
        title: { en: 'Yayasan Insan Prihatin Releases 2025 Annual Report', ms: 'Yayasan Insan Prihatin Keluarkan Laporan Tahunan 2025' },
        excerpt: { en: 'Our comprehensive report showcases the remarkable impact achieved across all programs.', ms: 'Laporan komprehensif kami mempamerkan impak luar biasa yang dicapai merentasi semua program.' },
        content: { en: 'We are pleased to announce the release of our 2025 Annual Report...', ms: 'Kami dengan sukacitanya mengumumkan pengeluaran Laporan Tahunan 2025 kami...' },
        category: 'announcements',
        isPublished: true,
        publishedAt: new Date('2026-01-15'),
      },
      {
        slug: 'scholarship-success-stories',
        title: { en: 'From Struggle to Success: How Scholarships Changed Their Lives', ms: 'Dari Kesusahan ke Kejayaan: Bagaimana Biasiswa Mengubah Hidup Mereka' },
        excerpt: { en: 'Meet three scholarship recipients who have overcome adversity to achieve academic excellence.', ms: 'Temui tiga penerima biasiswa yang telah mengatasi kesukaran untuk mencapai kecemerlangan akademik.' },
        content: { en: 'Education is the most powerful weapon which you can use to change the world...', ms: 'Pendidikan adalah senjata paling berkuasa yang boleh anda gunakan untuk mengubah dunia...' },
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
      { slug: 'home', title: { en: 'Home', ms: 'Laman Utama' }, metaTitle: { en: 'Yayasan Insan Prihatin | Empowering Communities Through Compassion', ms: 'Yayasan Insan Prihatin | Memperkasa Komuniti Melalui Belas Kasihan' }, metaDescription: { en: 'A prestigious Malaysian foundation dedicated to community service, education, and sustainable development.', ms: 'Yayasan Malaysia yang berprestij yang didedikasikan untuk perkhidmatan komuniti, pendidikan, dan pembangunan mampan.' } },
      { slug: 'about', title: { en: 'About Us', ms: 'Tentang Kami' }, metaTitle: { en: 'About Us | Yayasan Insan Prihatin', ms: 'Tentang Kami | Yayasan Insan Prihatin' }, metaDescription: { en: 'Learn about our mission, vision, and the team behind Yayasan Insan Prihatin.', ms: 'Ketahui tentang misi, visi, dan pasukan di sebalik Yayasan Insan Prihatin.' } },
      { slug: 'projects', title: { en: 'Projects', ms: 'Projek' }, metaTitle: { en: 'Our Projects | Yayasan Insan Prihatin', ms: 'Projek Kami | Yayasan Insan Prihatin' }, metaDescription: { en: 'Explore our ongoing and completed projects creating lasting impact across Malaysia.', ms: 'Terokai projek berterusan dan selesai kami yang mencipta impak berpanjangan di seluruh Malaysia.' } },
      { slug: 'blog', title: { en: 'Blog', ms: 'Blog' }, metaTitle: { en: 'Blog & News | Yayasan Insan Prihatin', ms: 'Blog & Berita | Yayasan Insan Prihatin' }, metaDescription: { en: 'Stay updated with the latest news, stories, and events from Yayasan Insan Prihatin.', ms: 'Kekal dikemas kini dengan berita, cerita, dan acara terkini dari Yayasan Insan Prihatin.' } },
      { slug: 'contact', title: { en: 'Contact', ms: 'Hubungi' }, metaTitle: { en: 'Contact Us | Yayasan Insan Prihatin', ms: 'Hubungi Kami | Yayasan Insan Prihatin' }, metaDescription: { en: 'Get in touch with us. We would love to hear from you.', ms: 'Hubungi kami. Kami ingin mendengar daripada anda.' } },
      { slug: 'donate', title: { en: 'Donate', ms: 'Derma' }, metaTitle: { en: 'Donate | Yayasan Insan Prihatin', ms: 'Derma | Yayasan Insan Prihatin' }, metaDescription: { en: 'Support our mission. Your donation helps transform lives across Malaysia.', ms: 'Sokong misi kami. Derma anda membantu mengubah hidup di seluruh Malaysia.' } },
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
