import { getTeamForUser } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { NextRequest } from 'next/server';

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  team: {
    id: number;
    name: string;
    subscriptionStatus: string | null;
    planName: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  } | null;
  error?: string;
}

export async function checkSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const team = await getTeamForUser(userId);
    
    if (!team) {
      return {
        hasActiveSubscription: false,
        team: null,
        error: 'User is not part of any team'
      };
    }

    const hasActiveSubscription = team.subscriptionStatus === 'active';
    
    return {
      hasActiveSubscription,
      team: {
        id: team.id,
        name: team.name,
        subscriptionStatus: team.subscriptionStatus,
        planName: team.planName,
        stripeCustomerId: team.stripeCustomerId,
        stripeSubscriptionId: team.stripeSubscriptionId
      }
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasActiveSubscription: false,
      team: null,
      error: error instanceof Error ? error.message : 'Failed to check subscription'
    };
  }
}

type RequestHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withSubscription(handler: RequestHandler) {
  return async function (request: NextRequest, ...args: any[]) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Authentication required',
            message: 'Please sign in to access this resource.'
          }), 
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const { hasActiveSubscription, team, error } = await checkSubscription(session.user.id);
      
      if (error || !team) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Team membership required',
            message: error || 'You need to be part of a team to access this feature.'
          }), 
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      if (!hasActiveSubscription) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Subscription required',
            message: 'Please upgrade your team plan to access this feature',
            teamId: team.id,
            teamName: team.name
          }), 
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Add team info to the request for the route handler to use
      const modifiedRequest = request as any;
      modifiedRequest.team = team;

      return handler(modifiedRequest, ...args);
    } catch (error) {
      console.error('Subscription check failed:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Internal server error',
          message: 'Failed to verify subscription status.'
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
