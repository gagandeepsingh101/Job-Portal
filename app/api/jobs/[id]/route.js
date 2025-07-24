import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jobSchema } from '@/lib/validations'

export async function GET(
  request,
  { params }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        applications: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Fetch the job to check ownership
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this job post.' }, { status: 403 });
    }

    const body = await request.json()
    const validatedData = jobSchema.parse(body)

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        customFields: validatedData.customFields || []
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Fetch the job to check ownership
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this job post.' }, { status: 403 });
    }

    await prisma.job.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}