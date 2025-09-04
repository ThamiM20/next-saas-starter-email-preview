import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { emailAddresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '@/lib/auth/session';

// Type for the email address record
interface EmailAddressRecord {
  id: number;
  email: string;
  userId: number | null;
  isPrimary: boolean | null;
  isVerified: boolean | null;
  verificationToken: string | null;
  verificationExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST() {
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

    // Generate a unique identifier for the email address
    const emailId = uuidv4().split('-')[0];
    const domain = process.env.EMAIL_DOMAIN || 'example.com';
    const email = `${emailId}@${domain}`;

    console.log('Generating email for user:', userId);
    
    // Ensure userId is a valid number
    const userIdNum = typeof userId === 'number' ? userId : parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      console.error('Invalid user ID:', userId);
      return new NextResponse('Invalid user ID', { status: 400 });
    }
    
    console.log('Looking for existing forwarding email for user ID:', userIdNum);
    
    // Check if user already has a forwarding email
    const existingEmails = await db
      .select()
      .from(emailAddresses)
      .where(
        and(
          eq(emailAddresses.userId, userIdNum),
          eq(emailAddresses.isPrimary, false) // Forwarding emails are not primary
        )
      )
      .limit(1);
    
    const existingEmail = existingEmails[0];
    let userEmail: EmailAddressRecord | undefined;
    
    if (existingEmail) {
      // Update existing forwarding email
      const result = await db
        .update(emailAddresses)
        .set({ 
          email,
          updatedAt: new Date(),
          isVerified: true,
          verificationToken: null,
          verificationExpires: null
        })
        .where(eq(emailAddresses.id, existingEmail.id))
        .returning();
      
      userEmail = result[0];
    } else {
      // Create new forwarding email
      const result = await db
        .insert(emailAddresses)
        .values({
          email,
          userId: userIdNum,
          isPrimary: false, // Not the primary email
          isVerified: true, // Mark as verified since we're generating it
          verificationToken: null,
          verificationExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      userEmail = result[0];
    }

    const response = { email: userEmail?.email || email };
    console.log('Generated email address:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating email address:');
    console.error(error);
    
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    const errorResponse: { error: string; stack?: string } = { 
      error: errorMessage 
    };
    
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorResponse.stack = error.stack;
    }
    
    return new NextResponse(JSON.stringify(errorResponse), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
