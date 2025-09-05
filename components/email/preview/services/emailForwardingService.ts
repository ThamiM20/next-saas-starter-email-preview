import { db } from '@/lib/db/drizzle';
import { emails, emailAddresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { emailService } from '@/lib/email/services/email-service';

export async function forwardEmail(emailId: string, userId: string, to: string) {
  try {
    // Get the email to forward
    const [email] = await db
      .select()
      .from(emails)
      .where(and(eq(emails.id, emailId), eq(emails.userId, userId)));

    if (!email) {
      throw new Error('Email not found');
    }

    // Get the user's email address for the "From" field
    const [userEmail] = await db
      .select()
      .from(emailAddresses)
      .where(eq(emailAddresses.userId, userId));

    if (!userEmail) {
      throw new Error('User email not found');
    }

    // Forward the email
    await emailService.sendEmail({
      from: userEmail.email,
      to,
      subject: `Fwd: ${email.subject}`,
      text: `---------- Forwarded message ---------
From: ${email.from}
Date: ${email.date}
Subject: ${email.subject}
To: ${email.to.join(', ')}

${email.body}
`,
      html: email.html ? `
        <div style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; color: #555;">
          <p>---------- Forwarded message ---------</p>
          <p><strong>From:</strong> ${email.from}</p>
          <p><strong>Date:</strong> ${email.date}</p>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>To:</strong> ${email.to.join(', ')}</p>
          <div style="margin-top: 20px;">
            ${email.html}
          </div>
        </div>
      ` : undefined,
    });

    return { success: true };
  } catch (error) {
    console.error('Error forwarding email:', error);
    throw new Error('Failed to forward email');
  }
}

export async function getForwardingEmail(userId: string): Promise<string | null> {
  try {
    const [email] = await db
      .select()
      .from(emailAddresses)
      .where(eq(emailAddresses.userId, userId))
      .limit(1);

    return email?.email || null;
  } catch (error) {
    console.error('Error getting forwarding email:', error);
    return null;
  }
}
