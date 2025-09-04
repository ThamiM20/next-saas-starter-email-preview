import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'No active session found',
        },
        { status: 401 }
      );
    }

    // Get user from database to ensure they exist
    const [user] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { 
          isActive: false, 
          status: 'no_team',
          message: 'User not found in team members',
        },
        { status: 404 }
      );
    }

    // Get team details
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, user.teamId));

    if (!team) {
      return NextResponse.json(
        { 
          isActive: false, 
          status: 'no_team',
          message: 'Team not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isActive: team.subscriptionStatus === 'active',
      status: team.subscriptionStatus || 'inactive',
      planName: team.planName || 'Free',
      currentPeriodEnd: team.currentPeriodEnd,
      customerId: team.customerId,
      subscriptionId: team.subscriptionId,
    });

  } catch (error) {
    console.error('Error in subscription route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
