/**
 * Email template for beta program welcome message
 */

interface WelcomeEmailProps {
  companyName: string;
  recipientEmail: string;
}

/**
 * Generates HTML content for the welcome email
 */
export function generateWelcomeEmailHtml(props: WelcomeEmailProps): string {
  const { companyName } = props;
  const currentYear = new Date().getFullYear();
  const logoUrl = '/logodark.svg'; // Use relative URL from public directory
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Vexa Beta Program</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; background-color: #f9fafb; }
        .email-wrapper { background-color: #ffffff; border-radius: 8px; overflow: hidden; margin: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background-color: #f3f4f6; padding: 30px 20px; text-align: center; }
        .logo { margin-bottom: 15px; }
        .content { padding: 30px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: 500; }
        .button:hover { background-color: #2563eb; }
        .discord-button { background-color: #5865F2; }
        .discord-button:hover { background-color: #4752c4; }
        h1 { color: #1f2937; font-size: 24px; margin-top: 10px; }
        h2 { color: #374151; font-size: 18px; margin-top: 25px; }
        .feature-box { background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .social-links { margin-top: 20px; }
        .social-links a { margin: 0 10px; color: #6b7280; text-decoration: none; }
        .social-links a:hover { color: #3b82f6; }
        .success-note { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px 15px; margin: 20px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .highlight { color: #2563eb; font-weight: 500; }
        .unsubscribe { font-size: 11px; color: #9ca3af; margin-top: 10px; }
        .unsubscribe a { color: #9ca3af; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Vexa Logo" width="120" height="40" style="display: block; margin: 0 auto;" />
          </div>
          <h1>Welcome to the Vexa Beta Program!</h1>
        </div>
        
        <div class="content">
          <div class="success-note">
            <strong>Email verified!</strong> Thank you for confirming your email address.
          </div>
          
          <p>Hello ${companyName},</p>
          
          <p>I'm <span class="highlight">Dmitry Grankin</span>, the founder of Vexa. Thank you for joining our private beta program! We're thrilled to have you on board and can't wait to see how you'll use our API.</p>
          
          <p>Your application has been received and is now in our review queue. We're carefully evaluating each request to ensure we can provide the best possible experience during this early access phase.</p>
          
          <h2>What is Vexa?</h2>
          <p>Vexa is an <strong>API for real-time meeting transcription</strong> that works with meeting bots and direct streaming from web/mobile apps. Our technology allows you to extract valuable knowledge from meetings across platforms like Google Meet, Zoom, and Microsoft Teams.</p>
          
          <div class="feature-box">
            <h3 style="margin-top: 0;">Key Features:</h3>
            <ul>
              <li><strong>Multilingual Support:</strong> Real-time transcription in 99 languages</li>
              <li><strong>Enhanced Readability:</strong> Real-time processing with LLM to improve transcription quality</li>
              <li><strong>Knowledge Extraction:</strong> Meeting insights with RAG for completed meetings</li>
              <li><strong>Superior Performance:</strong> Low-latency (5-10 seconds) even at scale</li>
              <li><strong>100% Free:</strong> During the entire beta period</li>
            </ul>
          </div>
          
          <h2>Next Steps</h2>
          <ol>
            <li>We'll review your application and get back to you within 1-2 business days</li>
            <li>Once approved, you'll receive API credentials and documentation access</li>
            <li>Our team will be available to help you with integration and implementation</li>
          </ol>
          
          <h2>Join Our Community</h2>
          <p>While you wait, we invite you to join our Discord community where you can:</p>
          <ul>
            <li>Connect with our engineering team directly</li>
            <li>Meet other beta participants and share experiences</li>
            <li>Get early updates on new features and improvements</li>
            <li>Provide feedback that will shape our development</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://discord.gg/Ga9duGkVz9" class="button discord-button">Join Discord Community</a>
          </div>
          
          <p>If you have any questions or need assistance, feel free to reply directly to this email. I personally read all messages from our beta users.</p>
          
          <p>Looking forward to having you on this journey with us!</p>
          
          <p>Best regards,<br>
          Dmitry Grankin<br>
          Founder, Vexa<br>
          <a href="mailto:dmitry@vexa.ai" style="color: #3b82f6;">dmitry@vexa.ai</a></p>
          
          <div class="social-links">
            <a href="https://twitter.com/grankin_d">Twitter</a> •
            <a href="https://github.com/Vexa-ai/vexa">GitHub</a> •
            <a href="https://discord.gg/Ga9duGkVz9">Discord</a>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${currentYear} Vexa.ai Inc. All rights reserved.</p>
          <p>This email was sent to you because you verified your email for the Vexa beta program.</p>
          <p class="unsubscribe">If you no longer wish to receive these emails, you can <a href="{{unsubscribe}}">unsubscribe</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates plain text content for the welcome email
 */
export function generateWelcomeEmailText(props: WelcomeEmailProps): string {
  const { companyName } = props;
  const currentYear = new Date().getFullYear();
  
  return `
WELCOME TO THE VEXA BETA PROGRAM!

Email verified! Thank you for confirming your email address.

Hello ${companyName},

I'm Dmitry Grankin, the founder of Vexa. Thank you for joining our private beta program! We're thrilled to have you on board and can't wait to see how you'll use our API.

Your application has been received and is now in our review queue. We're carefully evaluating each request to ensure we can provide the best possible experience during this early access phase.

WHAT IS VEXA?
Vexa is an API for real-time meeting transcription that works with meeting bots and direct streaming from web/mobile apps. Our technology allows you to extract valuable knowledge from meetings across platforms like Google Meet, Zoom, and Microsoft Teams.

KEY FEATURES:
- Multilingual Support: Real-time transcription in 99 languages
- Enhanced Readability: Real-time processing with LLM to improve transcription quality
- Knowledge Extraction: Meeting insights with RAG for completed meetings
- Superior Performance: Low-latency (5-10 seconds) even at scale
- 100% Free: During the entire beta period

NEXT STEPS:
1. We'll review your application and get back to you within 1-2 business days
2. Once approved, you'll receive API credentials and documentation access
3. Our team will be available to help you with integration and implementation

JOIN OUR COMMUNITY
While you wait, we invite you to join our Discord community where you can:
- Connect with our engineering team directly
- Meet other beta participants and share experiences
- Get early updates on new features and improvements
- Provide feedback that will shape our development

Join our Discord: https://discord.gg/Ga9duGkVz9

If you have any questions or need assistance, feel free to reply directly to this email. I personally read all messages from our beta users.

Looking forward to having you on this journey with us!

Best regards,
Dmitry Grankin
Founder, Vexa
dmitry@vexa.ai

Follow us:
Twitter: https://twitter.com/grankin_d
GitHub: https://github.com/Vexa-ai/vexa
Discord: https://discord.gg/Ga9duGkVz9

© ${currentYear} Vexa.ai Inc. All rights reserved.
This email was sent to you because you verified your email for the Vexa beta program.

To unsubscribe: {{unsubscribe}}
  `;
}

/**
 * Gets the email configuration for SendPulse API
 */
export function getWelcomeEmailConfig(props: WelcomeEmailProps) {
  const { companyName, recipientEmail } = props;
  
  return {
    email: {
      html: generateWelcomeEmailHtml(props),
      text: generateWelcomeEmailText(props),
      subject: 'Welcome to the Vexa Beta Program! 🚀',
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
 
 
 