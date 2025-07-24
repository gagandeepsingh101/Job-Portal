import { authOptions } from '@/lib/auth'
import { uploadFile } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const result = await uploadFile(file, 'resumes')

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}