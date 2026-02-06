/**
 * PDF Receipt Template
 *
 * Professional A4 single-page receipt template for donations using @react-pdf/renderer.
 * Includes organization branding with logo and donor details.
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

// Define styles - optimized for single page A4
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '65%',
  },
  logo: {
    width: 55,
    height: 55,
    objectFit: 'contain',
    marginRight: 12,
  },
  orgInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  orgName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
    marginBottom: 3,
  },
  orgTagline: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 6,
  },
  orgAddressLine: {
    fontSize: 7,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  orgContactInfo: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 3,
  },
  receiptTitle: {
    textAlign: 'right',
    alignItems: 'flex-end',
    width: '35%',
  },
  receiptLabel: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  receiptNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
    marginBottom: 3,
  },
  receiptDate: {
    fontSize: 8,
    color: '#6B7280',
  },
  mainContent: {
    marginTop: 15,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 9,
    color: '#1F2937',
    fontFamily: 'Helvetica-Bold',
  },
  amountSection: {
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 8,
    marginVertical: 15,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
  },
  messageSection: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
  },
  messageLabel: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 9,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  thankYouSection: {
    backgroundColor: '#F0FDF4',
    padding: 15,
    borderRadius: 6,
    marginVertical: 15,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    marginBottom: 4,
  },
  thankYouSubtext: {
    fontSize: 9,
    color: '#166534',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    fontSize: 7,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  footerRight: {
    textAlign: 'right',
    fontSize: 7,
    color: '#6B7280',
  },
  verificationText: {
    fontSize: 6,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 48,
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
              <View>
                {org.address.map((line, index) => (
                  <Text key={index} style={styles.orgAddressLine}>{line}</Text>
                ))}
              </View>
              <Text style={styles.orgContactInfo}>Tel: {org.phone}</Text>
              <Text style={styles.orgContactInfo}>Email: {org.email}</Text>
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
              <Text style={styles.messageText}>&quot;{data.message}&quot;</Text>
            </View>
          )}

          {/* Thank You Section */}
          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouText}>Thank You For Your Generosity!</Text>
            <Text style={styles.thankYouSubtext}>
              Your donation helps us continue our mission of empowering communities.
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
