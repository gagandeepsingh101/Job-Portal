import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Input validation schema for PUT requests
const updateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
}).strict();



// GET handler
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('GET user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = updateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: parsedData.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}