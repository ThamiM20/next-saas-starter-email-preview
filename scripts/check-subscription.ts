// scripts/check-subscription.ts
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import 'dotenv/config';

async function checkUserSubscription(email: string) {
  try {
    console.log(`Checking subscription status for: ${email}`);
    
    // Find the user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        teamMembers: {
          with: {
            team: true
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      return;
    }

    console.log('\n✅ User found:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Subscription Status: ${user.subscriptionStatus || 'Not set'}`);
    console.log(`- Plan: ${user.planName || 'No plan'}`);
    console.log(`- Stripe Customer ID: ${user.stripeCustomerId || 'Not set'}`);
    console.log(`- Stripe Subscription ID: ${user.stripeSubscriptionId || 'Not set'}`);

    if (user.teamMembers && user.teamMembers.length > 0) {
      console.log('\n👥 Team Memberships:');
      user.teamMembers.forEach((member, index) => {
        console.log(`  Team ${index + 1}:`);
        console.log(`  - Team ID: ${member.team.id}`);
        console.log(`  - Team Name: ${member.team.name || 'No name'}`);
        console.log(`  - Role: ${member.role}`);
        console.log(`  - Team Subscription Status: ${member.team.subscriptionStatus || 'Not set'}`);
        console.log(`  - Team Plan: ${member.team.planName || 'No plan'}`);
        console.log(`  - Stripe Customer ID: ${member.team.stripeCustomerId || 'Not set'}`);
        console.log(`  - Stripe Subscription ID: ${member.team.stripeSubscriptionId || 'Not set'}`);
      });
    } else {
      console.log('\nℹ️ No team memberships found for this user.');
    }

  } catch (error) {
    console.error('❌ Error checking subscription:', error);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkUserSubscription('test@example.com');