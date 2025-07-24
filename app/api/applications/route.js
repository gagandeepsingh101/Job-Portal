import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationSchema } from '@/lib/validations'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')

    const where = {}

    if (session.user.role === 'USER') {
      where.userId = session.user.id
    }

    if (jobId) {
      where.jobId = jobId
    }

    if (status) {
      where.status = status
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            title: true,
            department: true,
            location: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        },
        statusLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.application.count({ where })

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobId, answers, resumeUrl } = applicationSchema.parse(body)

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: session.user.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: session.user.id,
        answers,
        resumeUrl
      }
    })

    // Create initial status log
    await prisma.statusLog.create({
      data: {
        applicationId: application.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json(application)
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}