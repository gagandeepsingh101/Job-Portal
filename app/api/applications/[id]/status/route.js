import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'ON_HOLD']),
  notes: z.string().optional()
})

export async function PUT(
  request,
  { params }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, notes } = updateStatusSchema.parse(body)

    const application = await prisma.application.update({
      where: { id: params.id },
      data: { status }
    })

    // Create status log
    await prisma.statusLog.create({
      data: {
        applicationId: params.id,
        status,
        notes
      }
    })

    return NextResponse.json(application)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}