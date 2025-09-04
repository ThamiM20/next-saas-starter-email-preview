import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db/drizzle';
import { teamMembers, teams } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

type NextApiHandler = (req: NextRequest) => Promise<NextResponse>;

export async function requireActiveSubscription(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's team subscription status
    const userTeam = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
      with: {
        team: true
      }
    });

    if (!userTeam) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Team membership required',
          message: 'You need to be part of a team to access this feature.'
        }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if team has an active subscription
    if (userTeam.team.subscriptionStatus !== 'active') {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Active subscription required',
          message: 'Please upgrade your team plan to access this feature.'
        }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Team has an active subscription
    return null;
  } catch (error) {
    console.error('Subscription check failed:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'Unable to verify subscription status.'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const withSubscription = (handler: NextApiHandler) => {
  return async (req: NextRequest) => {
    const subscriptionCheck = await requireActiveSubscription(req);
    if (subscriptionCheck) return subscriptionCheck;
    return handler(req);
  };
};
