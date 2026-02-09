import { NextRequest, NextResponse } from 'next/server'
import { getForm, getFormSubmissions, FormField } from '@/lib/actions/forms'
import ExcelJS from 'exceljs'
import { requireAuth } from '@/lib/auth/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// Helper to format date for display
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Helper to get field label from fields array
function getFieldLabel(fields: FormField[], fieldId: string): string {
  const field = fields.find(f => f.id === fieldId)
  return field?.label || fieldId
}

// Helper to sanitize filename
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  // SECURITY: Require admin authentication - exports contain sensitive user data
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'xlsx'

    // Get form details
    const form = await getForm(id)
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    // Get submissions
    const submissions = await getFormSubmissions({ formId: id })

    // Get form fields for label mapping
    const formFields = (form.fields as FormField[]) || []

    // Extract all unique field IDs from submissions
    const allFieldIds = new Set<string>()
    submissions.forEach(sub => {
      const data = sub.data as Record<string, unknown>
      Object.keys(data).forEach(key => allFieldIds.add(key))
    })

    // Create ordered columns: metadata first, then form fields
    const metadataColumns = [
      { key: 'submissionId', header: 'Submission ID' },
      { key: 'submittedAt', header: 'Submitted At' },
      { key: 'submitterName', header: 'Submitter Name' },
      { key: 'submitterEmail', header: 'Submitter Email' },
      { key: 'sourceUrl', header: 'Source URL' },
      { key: 'sourceContentTitle', header: 'Source Content' },
      { key: 'isRead', header: 'Read Status' },
    ]

    // Create field columns with proper labels
    const fieldColumns = Array.from(allFieldIds).map(fieldId => ({
      key: fieldId,
      header: getFieldLabel(formFields, fieldId),
    }))

    const allColumns = [...metadataColumns, ...fieldColumns]

    // Prepare rows data
    const rows = submissions.map(sub => {
      const data = sub.data as Record<string, unknown>
      const row: Record<string, string | number | boolean> = {
        submissionId: sub.id,
        submittedAt: formatDate(sub.createdAt),
        submitterName: sub.submitterName || '',
        submitterEmail: sub.submitterEmail || '',
        sourceUrl: sub.sourceUrl || '',
        sourceContentTitle: sub.sourceContentTitle || '',
        isRead: sub.isRead ? 'Yes' : 'No',
      }

      // Add form field values
      allFieldIds.forEach(fieldId => {
        const value = data[fieldId]
        if (Array.isArray(value)) {
          row[fieldId] = value.join(', ')
        } else if (typeof value === 'boolean') {
          row[fieldId] = value ? 'Yes' : 'No'
        } else {
          row[fieldId] = value?.toString() || ''
        }
      })

      return row
    })

    const filename = sanitizeFilename(form.name)
    const timestamp = new Date().toISOString().split('T')[0]

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = allColumns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',')
      const csvRows = rows.map(row =>
        allColumns.map(col => {
          const value = row[col.key]?.toString() || ''
          return `"${value.replace(/"/g, '""')}"`
        }).join(',')
      )
      const csvContent = [csvHeader, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}_responses_${timestamp}.csv"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
    } else {
      // Generate XLSX with ExcelJS
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'YIP Admin'
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet('Form Responses', {
        headerFooter: {
          firstHeader: `${form.name} - Form Responses`,
        },
      })

      // Set up columns with proper widths
      worksheet.columns = allColumns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.key === 'submissionId' ? 40 :
               col.key === 'submittedAt' ? 20 :
               col.key === 'sourceUrl' ? 30 : 25,
      }))

      // Style the header row
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF14B8A6' }, // Teal color matching design
      }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
      headerRow.height = 25

      // Add data rows
      rows.forEach((row, index) => {
        const dataRow = worksheet.addRow(row)

        // Alternate row colors for readability
        if (index % 2 === 1) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }, // Light gray
          }
        }

        // Style unread rows differently
        if (row.isRead === 'No') {
          dataRow.font = { bold: true }
        }
      })

      // Add border to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          }
        })
      })

      // Freeze the header row
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]

      // Add summary sheet
      const summarySheet = workbook.addWorksheet('Summary')
      summarySheet.columns = [
        { header: 'Property', key: 'property', width: 25 },
        { header: 'Value', key: 'value', width: 40 },
      ]

      // Style summary header
      const summaryHeader = summarySheet.getRow(1)
      summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      summaryHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF14B8A6' },
      }

      // Add summary data
      const summaryData = [
        { property: 'Form Name', value: form.name },
        { property: 'Form Slug', value: form.slug },
        { property: 'Total Submissions', value: submissions.length },
        { property: 'Unread Submissions', value: submissions.filter(s => !s.isRead).length },
        { property: 'Export Date', value: formatDate(new Date()) },
        { property: 'Form Created', value: formatDate(form.createdAt) },
        { property: 'Form Description', value: form.description || 'N/A' },
      ]

      summaryData.forEach(data => {
        summarySheet.addRow(data)
      })

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}_responses_${timestamp}.xlsx"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
    }
  } catch (error) {
    console.error('Failed to export form responses:', error)
    return NextResponse.json(
      { error: 'Failed to export form responses' },
      { status: 500 }
    )
  }
}
