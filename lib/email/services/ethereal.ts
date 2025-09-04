import nodemailer from 'nodemailer';

// Using the provided Ethereal credentials
const ETHEREAL_CREDENTIALS = {
  user: 'rosanna22@ethereal.email',
  pass: 'yqneB6JdNGGyS2DBfT',
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false
};

let transporter: nodemailer.Transporter;

export async function getEtherealTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: ETHEREAL_CREDENTIALS.host,
      port: ETHEREAL_CREDENTIALS.port,
      secure: ETHEREAL_CREDENTIALS.secure,
      auth: {
        user: ETHEREAL_CREDENTIALS.user,
        pass: ETHEREAL_CREDENTIALS.pass
      }
    });
    
    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('Ethereal transporter is ready to take messages');
      console.log('View emails at: https://ethereal.email/messages');
    } catch (error) {
      console.error('Error connecting to Ethereal:', error);
      throw error;
    }
  }
  return transporter;
}

export function getEtherealWebUrl(): string {
  return 'https://ethereal.email/messages';
}
