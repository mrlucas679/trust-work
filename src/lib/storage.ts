import supabase from '@/lib/supabaseClient'

const RESUMES_BUCKET = 'resumes' // Create this bucket in Supabase Storage

export type UploadResult = {
    path: string
    url: string
}

/**
 * Upload a CV/resume file to Supabase Storage and return its public URL.
 * Assumes the 'resumes' bucket has public read access (or adjust to use signed URLs).
 */
export async function uploadCv(file: File, userId: string): Promise<UploadResult> {
    if (!userId) throw new Error('Not authenticated')
    const ext = file.name.split('.').pop() || 'pdf'
    const sanitized = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const filePath = `${userId}/${Date.now()}-${sanitized}`

    const { error: uploadErr } = await supabase.storage
        .from(RESUMES_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || (ext === 'pdf' ? 'application/pdf' : undefined),
        })

    if (uploadErr) throw uploadErr

    const { data } = supabase.storage.from(RESUMES_BUCKET).getPublicUrl(filePath)
    const publicUrl = data.publicUrl
    if (!publicUrl) throw new Error('Failed to get public URL')

    return { path: filePath, url: publicUrl }
}
