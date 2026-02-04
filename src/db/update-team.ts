/**
 * Update Team Members Script
 *
 * This script clears existing seed team members and adds the real
 * organizational structure from the Trust Deed (Surat Ikatan Amanah).
 *
 * Run with: npx tsx src/db/update-team.ts
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { randomUUID } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function updateTeamMembers() {
  console.log('🔄 Updating team members with official organization structure...')

  try {
    // First, delete all existing team members
    console.log('🗑️  Clearing existing team members...')
    await db.delete(schema.teamMembers)

    // Define the organizational hierarchy with IDs for parent relationships
    const founderAdlyId = randomUUID()
    const founderAshrafId = randomUUID()
    const chairmanMariamId = randomUUID()
    const financeDirectorSheikKhuzaifahId = randomUUID()
    const communicationsHeadAmmarId = randomUUID()
    const headOfItSuzarilId = randomUUID()

    // Real team members from Trust Deed (Surat Ikatan Amanah)
    const realTeam = [
      // Founders (Board of Directors level)
      {
        id: founderAdlyId,
        name: 'Adly bin Zahari',
        position: { en: 'Founder', ms: 'Pengasas' },
        department: 'Board of Directors',
        bio: {
          en: 'Co-founder of Yayasan Insan Prihatin, dedicated to community welfare and sustainable development.',
          ms: 'Pengasas bersama Yayasan Insan Prihatin, berdedikasi kepada kebajikan komuniti dan pembangunan mampan.'
        },
        sortOrder: 1,
        hierarchyLevel: 0,
        parentId: null,
        isActive: true,
      },
      {
        id: founderAshrafId,
        name: 'Ashraf Mukhlis bin Minghat',
        position: { en: 'Founder', ms: 'Pengasas' },
        department: 'Board of Directors',
        bio: {
          en: 'Co-founder of Yayasan Insan Prihatin, committed to education and social development.',
          ms: 'Pengasas bersama Yayasan Insan Prihatin, komited kepada pendidikan dan pembangunan sosial.'
        },
        sortOrder: 2,
        hierarchyLevel: 0,
        parentId: null,
        isActive: true,
      },

      // Board of Trustees
      {
        id: chairmanMariamId,
        name: 'Mariam binti Ilias',
        position: { en: 'Chairman', ms: 'Pengerusi' },
        department: 'Board of Trustees',
        bio: {
          en: 'Chairman of the Board of Trustees, overseeing governance and strategic direction of the foundation.',
          ms: 'Pengerusi Lembaga Pemegang Amanah, menyelia tadbir urus dan hala tuju strategik yayasan.'
        },
        sortOrder: 3,
        hierarchyLevel: 1,
        parentId: founderAdlyId,
        isActive: true,
      },
      {
        id: financeDirectorSheikKhuzaifahId,
        name: 'Sheikh Khuzaifah bin Sheik Abu Bakar',
        position: { en: 'Finance Director', ms: 'Pengarah Kewangan' },
        department: 'Board of Trustees',
        bio: {
          en: 'Finance Director responsible for financial oversight and compliance.',
          ms: 'Pengarah Kewangan bertanggungjawab untuk pengawasan dan pematuhan kewangan.'
        },
        sortOrder: 4,
        hierarchyLevel: 1,
        parentId: chairmanMariamId,
        isActive: true,
      },
      {
        id: communicationsHeadAmmarId,
        name: 'Mohamad Ammar bin Atan',
        position: { en: 'Head of Corporate Communication', ms: 'Ketua Komunikasi Korporat' },
        department: 'Board of Trustees',
        bio: {
          en: 'Head of Corporate Communication, managing public relations and organizational communications.',
          ms: 'Ketua Komunikasi Korporat, menguruskan perhubungan awam dan komunikasi organisasi.'
        },
        sortOrder: 5,
        hierarchyLevel: 1,
        parentId: chairmanMariamId,
        isActive: true,
      },

      // Finance Department
      {
        id: randomUUID(),
        name: 'Ainul Khairiyah binti Asrul Affendi',
        position: { en: 'Accountant', ms: 'Akauntan' },
        department: 'Finance',
        bio: {
          en: 'Accountant managing financial records and reporting.',
          ms: 'Akauntan menguruskan rekod kewangan dan pelaporan.'
        },
        sortOrder: 6,
        hierarchyLevel: 2,
        parentId: financeDirectorSheikKhuzaifahId,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: 'Afifah',
        position: { en: 'Finance Officer', ms: 'Pegawai Kewangan' },
        department: 'Finance',
        bio: {
          en: 'Finance Officer supporting financial operations.',
          ms: 'Pegawai Kewangan menyokong operasi kewangan.'
        },
        sortOrder: 7,
        hierarchyLevel: 2,
        parentId: financeDirectorSheikKhuzaifahId,
        isActive: true,
      },

      // IT Department
      {
        id: headOfItSuzarilId,
        name: 'Ts. Suzaril Shah',
        position: { en: 'Head of IT', ms: 'Ketua IT' },
        department: 'Information Technology',
        bio: {
          en: 'Head of IT, leading technology initiatives and digital transformation.',
          ms: 'Ketua IT, memimpin inisiatif teknologi dan transformasi digital.'
        },
        sortOrder: 8,
        hierarchyLevel: 2,
        parentId: chairmanMariamId,
        isActive: true,
      },
      {
        id: randomUUID(),
        name: 'Aizat',
        position: { en: 'IT Officer', ms: 'Pegawai IT' },
        department: 'Information Technology',
        bio: {
          en: 'IT Officer supporting technology operations and systems.',
          ms: 'Pegawai IT menyokong operasi dan sistem teknologi.'
        },
        sortOrder: 9,
        hierarchyLevel: 3,
        parentId: headOfItSuzarilId,
        isActive: true,
      },

      // Admin Office
      {
        id: randomUUID(),
        name: 'Firah',
        position: { en: 'Admin Officer', ms: 'Pegawai Pentadbiran' },
        department: 'Administration',
        bio: {
          en: 'Admin Officer managing office operations and administrative tasks.',
          ms: 'Pegawai Pentadbiran menguruskan operasi pejabat dan tugas pentadbiran.'
        },
        sortOrder: 10,
        hierarchyLevel: 2,
        parentId: chairmanMariamId,
        isActive: true,
      },
    ]

    // Insert all team members
    console.log('➕ Adding real team members...')
    for (const member of realTeam) {
      await db.insert(schema.teamMembers).values(member)
      console.log(`   ✓ Added: ${member.name} (${typeof member.position === 'object' ? member.position.en : member.position})`)
    }

    console.log('\n✅ Team members updated successfully!')
    console.log(`   Total members: ${realTeam.length}`)
    console.log('\n📊 Organizational Structure:')
    console.log('   🏛️  Board of Directors (Founders): 2')
    console.log('   👥 Board of Trustees: 3')
    console.log('   💰 Finance: 2')
    console.log('   💻 Information Technology: 2')
    console.log('   📋 Administration: 1')

  } catch (error) {
    console.error('❌ Error updating team members:', error)
    throw error
  }
}

updateTeamMembers()
