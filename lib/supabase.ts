import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to upload file to Supabase Storage
export async function uploadToSupabase(file: File, userId: string) {
  try {
    // Create unique filename with timestamp
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}-${file.name}`
    
    console.log('Uploading to Supabase:', fileName)
    
    const { data, error } = await supabase.storage
      .from('pdf')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw error
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf')
      .getPublicUrl(fileName)
    
    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        size: file.size,
        type: file.type
      }
    }
  } catch (error) {
    console.error('Supabase upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Helper function to get file from Supabase Storage
export async function getFileFromSupabase(path: string) {
  try {
    const { data, error } = await supabase.storage
      .from('pdf')
      .download(path)
    
    if (error) {
      throw error
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Supabase download error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    }
  }
}