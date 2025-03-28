/**
 * Email template for email verification (double opt-in)
 */

interface VerifyEmailProps {
  companyName: string;
  recipientEmail: string;
  verificationLink: string;
}

/**
 * Generates HTML content for the verification email
 */
export function generateVerifyEmailHtml(props: VerifyEmailProps): string {
  const { companyName, verificationLink } = props;
  const currentYear = new Date().getFullYear();
  // Use the full URL with domain for email clients
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logodark.svg`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email for Vexa Beta Program</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; background-color: #f9fafb; }
        .email-wrapper { background-color: #ffffff; border-radius: 8px; overflow: hidden; margin: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background-color: #f3f4f6; padding: 30px 20px; text-align: center; }
        .logo { margin-bottom: 15px; }
        .content { padding: 30px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: 500; }
        .verification-button { background-color: #2563eb; }
        .verification-button:hover { background-color: #1d4ed8; }
        h1 { color: #1f2937; font-size: 24px; margin-top: 10px; }
        h2 { color: #374151; font-size: 18px; }
        .link-container { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; word-break: break-all; border: 1px solid #e5e7eb; }
        .social-links { margin-top: 20px; }
        .social-links a { margin: 0 10px; color: #6b7280; text-decoration: none; }
        .social-links a:hover { color: #3b82f6; }
        .expiry-note { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 15px; margin: 20px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Vexa Logo" width="120" height="40" style="display: block; margin: 0 auto;" />
          </div>
          <h1>Verify Your Email Address</h1>
        </div>
        
        <div class="content">
          <p>Hello ${companyName},</p>
          
          <p>Thank you for your interest in joining the <strong>Vexa Beta Program</strong>. We're excited to have you on board! Please verify your email address to complete your application.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="button verification-button">Verify My Email</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <div class="link-container">${verificationLink}</div>
          
          <div class="expiry-note">
            <strong>Important:</strong> This verification link will expire in 24 hours.
          </div>
          
          <h2>What happens after verification?</h2>
          <p>Once verified, we'll review your application for the Vexa Beta Program. As a beta participant, you'll get access to:</p>
          <ul>
            <li><strong>Free access</strong> to our API during the beta period</li>
            <li><strong>Real-time transcription</strong> for meetings across major platforms</li>
            <li><strong>Direct support</strong> from our engineering team</li>
            <li><strong>Early access</strong> to new features before public release</li>
          </ul>
          
          <p>While waiting for your application to be processed, you can join our Discord community to connect with other beta users and our team:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://discord.gg/Ga9duGkVz9" class="button" style="background-color: #5865F2;">Join Discord Community</a>
          </div>
          
          <p>If you did not request to join the Vexa Beta Program, please disregard this email.</p>
          
          <p>Best regards,<br>
          Dmitry Grankin<br>
          Founder, Vexa</p>
          
          <div class="social-links">
            <a href="https://twitter.com/grankin_d">Twitter</a> •
            <a href="https://github.com/Vexa-ai/vexa">GitHub</a> •
            <a href="https://discord.gg/Ga9duGkVz9">Discord</a>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${currentYear} Vexa.ai Inc. All rights reserved.</p>
          <p>This is a one-time email sent to verify your address. You won't receive any further emails until you verify.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates plain text content for the verification email
 */
export function generateVerifyEmailText(props: VerifyEmailProps): string {
  const { companyName, verificationLink } = props;
  const currentYear = new Date().getFullYear();
  
  return `
VERIFY YOUR EMAIL FOR VEXA BETA PROGRAM

Hello ${companyName},

Thank you for your interest in joining the Vexa Beta Program. We're excited to have you on board! Please verify your email address to complete your application by clicking on the link below:

${verificationLink}

IMPORTANT: This verification link will expire in 24 hours.

WHAT HAPPENS AFTER VERIFICATION?
Once verified, we'll review your application for the Vexa Beta Program. As a beta participant, you'll get access to:
- Free access to our API during the beta period
- Real-time transcription for meetings across major platforms
- Direct support from our engineering team
- Early access to new features before public release

While waiting for your application to be processed, you can join our Discord community to connect with other beta users and our team:
https://discord.gg/Ga9duGkVz9

If you did not request to join the Vexa Beta Program, please disregard this email.

Best regards,
Dmitry Grankin
Founder, Vexa

Follow us:
Twitter: https://twitter.com/grankin_d
GitHub: https://github.com/Vexa-ai/vexa
Discord: https://discord.gg/Ga9duGkVz9

© ${currentYear} Vexa.ai Inc. All rights reserved.
This is a one-time email sent to verify your address. You won't receive any further emails until you verify.
  `;
}

/**
 * Gets the email configuration for SendPulse API
 */
export function getVerifyEmailConfig(props: VerifyEmailProps) {
  const { companyName, recipientEmail, verificationLink } = props;
  
  return {
    email: {
      html: generateVerifyEmailHtml(props),
      text: generateVerifyEmailText(props),
      subject: 'Verify Your Email for Vexa Beta Access',
      from: {
        name: 'Dmitry from Vexa',
        email: 'dmitry@vexa.ai',
      },
      to: [
        {
          name: companyName,
          email: recipientEmail
        }
      ]
    }
  };
} 
 
 
 