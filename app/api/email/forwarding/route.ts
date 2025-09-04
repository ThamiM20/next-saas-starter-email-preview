import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { emailAddresses } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('session');
    
    if (!session?.value) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const sessionData = await verifyToken(session.value);
    const userId = sessionData?.user?.id;
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Ensure userId is a valid number
    const userIdNum = typeof userId === 'number' ? userId : parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }
    
    // Check if user already has a forwarding email
    const [existingEmail] = await db
      .select()
      .from(emailAddresses)
      .where(
        and(
          eq(emailAddresses.userId, userIdNum),
          eq(emailAddresses.isPrimary, false) // Forwarding emails are not primary
        )
      )
      .limit(1);

    if (existingEmail) {
      return NextResponse.json({ email: existingEmail.email });
    }

    return new NextResponse(null, { status: 204 }); // No content if no email exists
  } catch (error) {
    console.error('Error checking forwarding email:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
