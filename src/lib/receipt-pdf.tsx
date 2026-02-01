/**
 * PDF Receipt Template
 *
 * Professional A4 receipt template for donations using @react-pdf/renderer.
 * Includes organization branding with logo, donor details, and tax deduction information.
 */

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { ReceiptData, organizationDetails, formatAmount, formatReceiptDate } from './receipt'
import path from 'path'
import fs from 'fs'

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
    maxWidth: '60%',
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  orgInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
    marginBottom: 3,
  },
  orgTagline: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 6,
  },
  orgDetails: {
    fontSize: 7,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  receiptTitle: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  receiptLabel: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 9,
    color: '#6B7280',
  },
  mainContent: {
    marginTop: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 10,
    color: '#1F2937',
    fontFamily: 'Helvetica-Bold',
  },
  amountSection: {
    backgroundColor: '#F0FDFA',
    padding: 20,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
  },
  amountCurrency: {
    fontSize: 14,
    color: '#0D9488',
    marginTop: 2,
  },
  messageSection: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 6,
    marginVertical: 15,
  },
  messageLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 10,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  taxNotice: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 6,
    marginVertical: 20,
  },
  taxTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6,
  },
  taxText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  footerRight: {
    textAlign: 'right',
    fontSize: 8,
    color: '#6B7280',
  },
  verificationText: {
    fontSize: 7,
    color: '#9CA3AF',
    marginTop: 10,
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    fontSize: 60,
    color: '#E5E7EB',
    opacity: 0.3,
    transform: 'rotate(-30deg)',
    fontFamily: 'Helvetica-Bold',
  },
})

interface ReceiptPDFProps {
  data: ReceiptData
}

/**
 * Get logo source - tries to load the logo as base64 for PDF rendering
 */
function getLogoSource(logoUrl?: string): string | null {
  if (!logoUrl) return null

  // If it's already a data URL or full URL, use it directly
  if (logoUrl.startsWith('data:') || logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl
  }

  // Try to read local file and convert to base64
  try {
    // For local paths starting with /, look in the public directory
    const publicPath = path.join(process.cwd(), 'public', logoUrl)
    if (fs.existsSync(publicPath)) {
      const imageBuffer = fs.readFileSync(publicPath)
      const base64 = imageBuffer.toString('base64')
      const mimeType = logoUrl.endsWith('.png') ? 'image/png' : 'image/jpeg'
      return `data:${mimeType};base64,${base64}`
    }

    // Also try the root directory for files like YIP-main-logo-transparent.png
    const rootPath = path.join(process.cwd(), logoUrl.replace(/^\//, ''))
    if (fs.existsSync(rootPath)) {
      const imageBuffer = fs.readFileSync(rootPath)
      const base64 = imageBuffer.toString('base64')
      const mimeType = logoUrl.endsWith('.png') ? 'image/png' : 'image/jpeg'
      return `data:${mimeType};base64,${base64}`
    }
  } catch (error) {
    console.error('Failed to load logo for PDF:', error)
  }

  return null
}

export function ReceiptPDF({ data }: ReceiptPDFProps) {
  // Use organization config from data if available, fallback to defaults
  const org = data.organization || organizationDetails

  // Get logo source
  const logoSrc = getLogoSource(org.logoUrl)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>OFFICIAL RECEIPT</Text>

        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {logoSrc && (
              <Image src={logoSrc} style={styles.logo} />
            )}
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>{org.name}</Text>
              <Text style={styles.orgTagline}>{org.tagline}</Text>
              <Text style={styles.orgDetails}>
                {org.address.join('\n')}
              </Text>
              <Text style={styles.orgDetails}>
                Tel: {org.phone}
              </Text>
              <Text style={styles.orgDetails}>
                Email: {org.email}
              </Text>
            </View>
          </View>
          <View style={styles.receiptTitle}>
            <Text style={styles.receiptLabel}>RECEIPT</Text>
            <Text style={styles.receiptNumber}>{data.receiptNumber}</Text>
            <Text style={styles.receiptDate}>
              {formatReceiptDate(new Date(data.completedAt))}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Donor Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donor Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{data.donorName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{data.donorEmail}</Text>
              </View>
              {data.donorPhone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{data.donorPhone}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Donation Amount */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Donation Amount</Text>
            <Text style={styles.amountValue}>
              {formatAmount(data.amount, data.currency)}
            </Text>
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Reference Number</Text>
                <Text style={styles.infoValue}>{data.paymentReference}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>{data.paymentMethod.toUpperCase()}</Text>
              </View>
              {data.transactionId && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Transaction ID</Text>
                  <Text style={styles.infoValue}>{data.transactionId}</Text>
                </View>
              )}
              {data.projectTitle && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Project/Purpose</Text>
                  <Text style={styles.infoValue}>{data.projectTitle}</Text>
                </View>
              )}
              {!data.projectTitle && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Purpose</Text>
                  <Text style={styles.infoValue}>General Fund</Text>
                </View>
              )}
            </View>
          </View>

          {/* Donor Message */}
          {data.message && (
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Your Message</Text>
              <Text style={styles.messageText}>"{data.message}"</Text>
            </View>
          )}

          {/* Tax Notice */}
          <View style={styles.taxNotice}>
            <Text style={styles.taxTitle}>Tax Deduction Notice</Text>
            <Text style={styles.taxText}>
              {org.name} is a registered charitable organization under the
              Companies Commission of Malaysia (Registration No: {org.registrationNumber}).
              {'\n\n'}
              Your donation may be eligible for tax deduction under Section 44(6) of the
              Income Tax Act 1967. Tax Exemption Reference: {org.taxExemptionRef}
              {'\n\n'}
              Please retain this receipt for your tax records.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View>
              <Text style={styles.footerLeft}>
                {org.name}
              </Text>
              <Text style={styles.footerLeft}>
                Registration No: {org.registrationNumber}
              </Text>
              <Text style={styles.footerLeft}>
                Website: {org.website}
              </Text>
            </View>
            <View>
              <Text style={styles.footerRight}>
                Thank you for your generous donation.
              </Text>
              <Text style={styles.footerRight}>
                Together, we make a difference.
              </Text>
            </View>
          </View>
          <Text style={styles.verificationText}>
            This is an electronically generated receipt. For verification, please contact {org.email}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default ReceiptPDF
