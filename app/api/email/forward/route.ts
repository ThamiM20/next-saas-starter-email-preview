import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { forwardEmailToUser } from '@/app/(dashboard)/dashboard/email/services/emailForwardingService';
import { withSubscription } from '@/lib/middleware/withSubscription';
import { Session } from 'next-auth';

async function handleForwardRequest(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to perform this action' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    const { emailId } = data;

    if (!emailId) {
      return new NextResponse(
        JSON.stringify({ error: 'Bad Request', message: 'Email ID is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await forwardEmailToUser(emailId, userId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email forwarded successfully' 
    });
  } catch (error) {
    console.error('Error forwarding email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('subscription') ? 403 : 500;
    
    return NextResponse.json(
      { 
        error: statusCode === 403 ? 'Forbidden' : 'Internal Server Error',
        message: errorMessage 
      },
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Wrap the handler with subscription check
export const POST = withSubscription(handleForwardRequest);
