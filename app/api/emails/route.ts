import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db/drizzle';
import { emails } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(emails)
      .where(eq(emails.userId, session.user.id))
      .orderBy(desc(emails.received_at));

    if (status && status !== 'all') {
      query = query.where(
        and(
          eq(emails.userId, session.user.id),
          eq(emails.status, status)
        )
      );
    }

    const userEmails = await query;

    // Transform database emails to match frontend format
    const formattedEmails = userEmails.map((email) => ({
      id: email.id.toString(),
      title: email.subject || 'No subject',
      dateProcessed: email.processed_at || email.received_at,
      status: mapStatusToFrontend(email.status),
      from: email.from,
      to: email.to,
      hasAttachments: email.has_attachments,
    }));

    return NextResponse.json(formattedEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Error fetching emails' },
      { status: 500 }
    );
  }
}

// Map database status to frontend status
function mapStatusToFrontend(status: string): 'Completed' | 'Processing' | 'Failed' {
  switch (status) {
    case 'forwarded':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'received':
    default:
      return 'Processing';
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return new NextResponse('Email ID is required', { status: 400 });
    }

    // Verify the email belongs to the user
    const [email] = await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.id, parseInt(id)),
          eq(emails.userId, session.user.id)
        )
      )
      .limit(1);

    if (!email) {
      return new NextResponse('Email not found', { status: 404 });
    }

    // Delete the email
    await db
      .delete(emails)
      .where(eq(emails.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json(
      { error: 'Error deleting email' },
      { status: 500 }
    );
  }
}
