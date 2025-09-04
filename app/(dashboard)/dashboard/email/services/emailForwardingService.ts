import { db } from '@/lib/db/drizzle';
import { emailAddresses, emails, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { emailService } from '@/lib/email/services/email-service';
import type { SendEmailOptions } from '@/lib/email/types/email';
import { User } from 'next-auth';

export async function getForwardingEmail(userId: string): Promise<string | null> {
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) return null;

  const [emailRecord] = await db
    .select()
    .from(emailAddresses)
    .where(
      eq(emailAddresses.userId, userIdNum)
    )
    .limit(1);

  return emailRecord?.email || null;
}

export async function forwardEmailToUser(emailId: string, userId: string) {
  // Convert string IDs to numbers for the database query
  const emailIdNum = parseInt(emailId, 10);
  const userIdNum = parseInt(userId, 10);
  
  if (isNaN(emailIdNum) || isNaN(userIdNum)) {
    throw new Error('Invalid email or user ID');
  }
  
  // Check if user has an active subscription
  const [userRecord] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
    
  if (userRecord?.subscriptionStatus !== 'active') {
    throw new Error('Active subscription required to forward emails');
  }

  // Verify the email belongs to the user
  const [email] = await db
    .select()
    .from(emails)
    .where(and(eq(emails.id, emailIdNum), eq(emails.userId, userIdNum)));
    
  if (!email) {
    throw new Error('Email not found or access denied');
  }

  // Get the user's primary email
  const [userEmailRecord] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId)); // Using the string ID directly since schema expects string

  const userEmail = userEmailRecord?.email;
  if (!userEmail) {
    throw new Error('User email not found');
  }

  // Prepare email content with required fields
  const emailOptions: SendEmailOptions = {
    from: `Forwarding <rosanna22@ethereal.email>`,
    to: userEmail,
    subject: `Fwd: ${email.subject || 'No Subject'}`,
    // Ensure we have valid strings for required fields
    text: typeof email.text === 'string' ? email.text : '',
    html: typeof email.html === 'string' ? email.html : ''
  };

  // Add optional fields if they exist and are valid
  if (Array.isArray(email.cc) && email.cc.length > 0) {
    emailOptions.cc = email.cc.join(', ');
  }
  if (Array.isArray(email.bcc) && email.bcc.length > 0) {
    emailOptions.bcc = email.bcc.join(', ');
  }

  // Send the email
  await emailService.sendEmail(emailOptions);

  // Update email status to processed after forwarding
  await db
    .update(emails)
    .set({ 
      status: 'processed' as const, 
      updatedAt: new Date() 
    })
    .where(eq(emails.id, emailIdNum));
}
