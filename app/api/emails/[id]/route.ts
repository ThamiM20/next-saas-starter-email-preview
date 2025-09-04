import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { emailService } from '@/app/(dashboard)/dashboard/email/services/emailService';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { emails } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = cookies().get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    const session = await verifyToken(sessionToken);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const email = await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.id, parseInt(params.id)),
          eq(emails.userId, session.user.id)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: email.id.toString(),
      subject: email.subject,
      from: email.from,
      to: email.to,
      html: email.html,
      text: email.text,
      receivedAt: email.receivedAt,
      status: email.status,
      hasAttachments: email.hasAttachments
    });
  } catch (error) {
    console.error('Error fetching email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = cookies().get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    const session = await verifyToken(sessionToken);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const emailId = params.id;
    if (!emailId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }

    const success = await emailService.deleteEmail(emailId, String(session.user.id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Email not found or you do not have permission' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
