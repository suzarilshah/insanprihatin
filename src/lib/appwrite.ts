import { Client, Storage, ID } from 'appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const storage = new Storage(client)

export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!

export async function uploadFile(file: File): Promise<string> {
  const response = await storage.createFile(BUCKET_ID, ID.unique(), file)
  return response.$id
}

export function getFileUrl(fileId: string): string {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
}

export function getFilePreview(
  fileId: string,
  width?: number,
  height?: number,
  quality?: number
): string {
  const params = new URLSearchParams()
  if (width) params.set('width', width.toString())
  if (height) params.set('height', height.toString())
  if (quality) params.set('quality', quality.toString())
  params.set('project', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/preview?${params.toString()}`
}

export async function deleteFile(fileId: string): Promise<void> {
  await storage.deleteFile(BUCKET_ID, fileId)
}

export { ID }
