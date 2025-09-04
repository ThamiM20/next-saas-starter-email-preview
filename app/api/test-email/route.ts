import { sendEmail } from '@/lib/email/services/mailtrap';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await sendEmail(
      'test@example.com',
      'Test Email from Mailtrap',
      'This is a test email sent through Mailtrap',
      '<p>This is a test email sent through <strong>Mailtrap</strong></p>'
    );

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
