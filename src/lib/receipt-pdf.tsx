/**
 * PDF Receipt Template
 *
 * Professional A4 receipt template for donations using @react-pdf/renderer.
 * Includes organization branding, donor details, and tax deduction information.
 */

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { ReceiptData, organizationDetails, formatAmount, formatReceiptDate } from './receipt'

// Register custom fonts (optional - uses default if not available)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
// })

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
    flexDirection: 'column',
  },
  orgName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0D9488',
    marginBottom: 4,
  },
  orgTagline: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 8,
  },
  orgDetails: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  receiptTitle: {
    textAlign: 'right',
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

export function ReceiptPDF({ data }: ReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>OFFICIAL RECEIPT</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.orgName}>{organizationDetails.name}</Text>
            <Text style={styles.orgTagline}>Empowering Communities, Transforming Lives</Text>
            <Text style={styles.orgDetails}>
              {organizationDetails.address.join('\n')}
            </Text>
            <Text style={styles.orgDetails}>
              Tel: {organizationDetails.phone}
            </Text>
            <Text style={styles.orgDetails}>
              Email: {organizationDetails.email}
            </Text>
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
              {organizationDetails.name} is a registered charitable organization under the
              Companies Commission of Malaysia (Registration No: {organizationDetails.registrationNumber}).
              {'\n\n'}
              Your donation may be eligible for tax deduction under Section 44(6) of the
              Income Tax Act 1967. Tax Exemption Reference: {organizationDetails.taxExemptionRef}
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
                {organizationDetails.name}
              </Text>
              <Text style={styles.footerLeft}>
                Registration No: {organizationDetails.registrationNumber}
              </Text>
              <Text style={styles.footerLeft}>
                Website: {organizationDetails.website}
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
            This is an electronically generated receipt. For verification, please contact {organizationDetails.email}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default ReceiptPDF
