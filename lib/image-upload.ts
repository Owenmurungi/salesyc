import { supabaseAdmin } from './supabase'

const BUCKET = 'product-images'

export async function uploadProductImage(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  // Make filename unique using timestamp
  const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(uniqueName, file, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) throw new Error(`Image upload failed: ${error.message}`)

  // Build the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Extract file path from the full URL
  const url = new URL(imageUrl)
  const pathParts = url.pathname.split(`/object/public/${BUCKET}/`)
  if (pathParts.length < 2) return

  const filePath = pathParts[1]
  await supabaseAdmin.storage.from(BUCKET).remove([filePath])
}
