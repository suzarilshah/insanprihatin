/**
 * Microsoft Graph API Integration
 *
 * This file provides the groundwork for future Microsoft 365 integration.
 * Once you have a Microsoft 365 tenant with Entra ID configured, uncomment
 * and configure the integration.
 *
 * Prerequisites:
 * 1. Register an application in Azure Portal (Entra ID)
 * 2. Configure API permissions:
 *    - User.Read (Sign in and read user profile)
 *    - User.Read.All (Read all users' full profiles)
 *    - Directory.Read.All (Read org hierarchy data)
 * 3. Create a client secret
 * 4. Set environment variables (see below)
 *
 * Environment Variables Required:
 * - AZURE_AD_CLIENT_ID: Application (client) ID from Azure Portal
 * - AZURE_AD_CLIENT_SECRET: Client secret value
 * - AZURE_AD_TENANT_ID: Directory (tenant) ID
 *
 * Documentation:
 * - Azure AD App Registration: https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app
 * - Microsoft Graph API: https://learn.microsoft.com/en-us/graph/overview
 * - Org Chart with Graph: https://learn.microsoft.com/en-us/graph/api/user-list-directreports
 */

// Types for Microsoft Graph API responses
export interface MicrosoftUser {
  id: string
  displayName: string
  givenName?: string
  surname?: string
  jobTitle?: string
  mail?: string
  mobilePhone?: string
  officeLocation?: string
  department?: string
  userPrincipalName: string
  manager?: {
    id: string
    displayName?: string
  }
  photo?: string // Base64 encoded or URL
}

export interface OrgHierarchy {
  user: MicrosoftUser
  directReports: MicrosoftUser[]
}

// Configuration check
export function isMicrosoftGraphConfigured(): boolean {
  return !!(
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  )
}

// Placeholder functions - implement when M365 is available

/**
 * Get an access token for Microsoft Graph API
 * Uses client credentials flow for application permissions
 */
export async function getGraphAccessToken(): Promise<string | null> {
  if (!isMicrosoftGraphConfigured()) {
    console.warn('Microsoft Graph API is not configured')
    return null
  }

  // TODO: Implement when M365 tenant is available
  // const tokenEndpoint = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`
  // const params = new URLSearchParams({
  //   client_id: process.env.AZURE_AD_CLIENT_ID!,
  //   client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
  //   scope: 'https://graph.microsoft.com/.default',
  //   grant_type: 'client_credentials',
  // })
  // const response = await fetch(tokenEndpoint, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: params,
  // })
  // const data = await response.json()
  // return data.access_token

  return null
}

/**
 * Fetch all users from Microsoft Graph API
 */
export async function getMicrosoftUsers(): Promise<MicrosoftUser[]> {
  if (!isMicrosoftGraphConfigured()) {
    console.warn('Microsoft Graph API is not configured')
    return []
  }

  // TODO: Implement when M365 tenant is available
  // const token = await getGraphAccessToken()
  // if (!token) return []
  //
  // const response = await fetch(
  //   'https://graph.microsoft.com/v1.0/users?$select=id,displayName,givenName,surname,jobTitle,mail,mobilePhone,officeLocation,department,userPrincipalName',
  //   {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }
  // )
  // const data = await response.json()
  // return data.value

  return []
}

/**
 * Get a user's manager (for building hierarchy)
 */
export async function getUserManager(userId: string): Promise<MicrosoftUser | null> {
  if (!isMicrosoftGraphConfigured()) {
    return null
  }

  // TODO: Implement when M365 tenant is available
  // const token = await getGraphAccessToken()
  // if (!token) return null
  //
  // const response = await fetch(
  //   `https://graph.microsoft.com/v1.0/users/${userId}/manager`,
  //   {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }
  // )
  // if (response.status === 404) return null // No manager
  // const data = await response.json()
  // return data

  return null
}

/**
 * Get a user's direct reports
 */
export async function getUserDirectReports(userId: string): Promise<MicrosoftUser[]> {
  if (!isMicrosoftGraphConfigured()) {
    return []
  }

  // TODO: Implement when M365 tenant is available
  // const token = await getGraphAccessToken()
  // if (!token) return []
  //
  // const response = await fetch(
  //   `https://graph.microsoft.com/v1.0/users/${userId}/directReports`,
  //   {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }
  // )
  // const data = await response.json()
  // return data.value

  return []
}

/**
 * Get user's profile photo
 */
export async function getUserPhoto(userId: string): Promise<string | null> {
  if (!isMicrosoftGraphConfigured()) {
    return null
  }

  // TODO: Implement when M365 tenant is available
  // const token = await getGraphAccessToken()
  // if (!token) return null
  //
  // try {
  //   const response = await fetch(
  //     `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`,
  //     {
  //       headers: { Authorization: `Bearer ${token}` },
  //     }
  //   )
  //   if (!response.ok) return null
  //   const blob = await response.blob()
  //   const buffer = await blob.arrayBuffer()
  //   const base64 = Buffer.from(buffer).toString('base64')
  //   return `data:image/jpeg;base64,${base64}`
  // } catch {
  //   return null
  // }

  return null
}

/**
 * Build complete org hierarchy from Microsoft Graph
 */
export async function buildOrgHierarchy(): Promise<Map<string, OrgHierarchy>> {
  if (!isMicrosoftGraphConfigured()) {
    return new Map()
  }

  // TODO: Implement when M365 tenant is available
  // 1. Fetch all users
  // 2. For each user, fetch their manager
  // 3. Build a tree structure

  return new Map()
}

/**
 * Sync Microsoft 365 users to local teamMembers table
 * This function will map M365 users to the local schema
 */
export async function syncMicrosoftUsersToTeam(): Promise<{
  success: boolean
  synced: number
  errors: string[]
}> {
  if (!isMicrosoftGraphConfigured()) {
    return {
      success: false,
      synced: 0,
      errors: ['Microsoft Graph API is not configured'],
    }
  }

  // TODO: Implement when M365 tenant is available
  // 1. Fetch all users from Microsoft Graph
  // 2. For each user:
  //    - Check if microsoftId exists in teamMembers
  //    - If exists, update the record
  //    - If not, create new record
  // 3. Optionally, deactivate users that are no longer in M365

  return {
    success: false,
    synced: 0,
    errors: ['Not implemented - awaiting M365 tenant configuration'],
  }
}

/**
 * Map Microsoft user to TeamMember format
 */
export function mapMicrosoftUserToTeamMember(msUser: MicrosoftUser) {
  return {
    name: msUser.displayName,
    position: msUser.jobTitle || 'Team Member',
    department: msUser.department || null,
    email: msUser.mail || null,
    phone: msUser.mobilePhone || null,
    microsoftId: msUser.id,
    // parentId will be resolved separately based on manager relationship
  }
}
