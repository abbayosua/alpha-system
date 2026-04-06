import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}, ${ALLOWED_VIDEO_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Max size: ${isImage ? '10MB' : '50MB'}`,
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')
    const filename = `${randomUUID()}.${ext}`
    const subfolder = isImage ? 'images' : 'videos'
    const filepath = join(process.cwd(), 'public', 'uploads', subfolder, filename)

    // Ensure directory exists
    const { mkdir } = await import('fs/promises')
    await mkdir(join(process.cwd(), 'public', 'uploads', subfolder), {
      recursive: true,
    })

    // Write file
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    const publicPath = `/uploads/${subfolder}/${filename}`

    return NextResponse.json(
      {
        success: true,
        data: {
          path: publicPath,
          filename,
          mimetype: file.type,
          size: file.size,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
