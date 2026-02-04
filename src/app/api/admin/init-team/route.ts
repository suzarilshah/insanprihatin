import { NextRequest, NextResponse } from 'next/server'
import { db, teamMembers } from '@/db'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

// One-time setup endpoint for initializing official team members
// Use with: curl -X POST http://localhost:3000/api/admin/init-team -H "X-Setup-Token: YIP-INIT-2025"
export async function POST(request: NextRequest) {
  try {
    // Check for setup token to prevent unauthorized access
    const setupToken = request.headers.get('X-Setup-Token')
    if (setupToken !== 'YIP-INIT-2025') {
      return NextResponse.json(
        { success: false, error: 'Invalid setup token' },
        { status: 401 }
      )
    }

    // Clear existing team members
    await db.delete(teamMembers)

    // Generate UUIDs for parent relationships
    const founderAdlyId = randomUUID()
    const founderAshrafId = randomUUID()
    const chairmanMariamId = randomUUID()
    const financeDirectorSheikKhuzaifahId = randomUUID()
    const communicationsHeadAmmarId = randomUUID()
    const headOfItSuzarilId = randomUUID()

    // Real team members from Trust Deed (Surat Ikatan Amanah)
    const officialTeam = [
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
    for (const member of officialTeam) {
      await db.insert(teamMembers).values(member)
    }

    revalidatePath('/about')
    revalidatePath('/admin/dashboard/team')

    return NextResponse.json({
      success: true,
      count: officialTeam.length,
      message: 'Official team structure initialized from Trust Deed',
      summary: {
        'Board of Directors (Founders)': 2,
        'Board of Trustees': 3,
        'Finance': 2,
        'Information Technology': 2,
        'Administration': 1,
      }
    })
  } catch (error) {
    console.error('Error initializing team:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to initialize team' },
      { status: 500 }
    )
  }
}
