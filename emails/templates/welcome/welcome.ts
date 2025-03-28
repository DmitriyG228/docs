/**
 * Types for welcome email props
 */
export interface WelcomeEmailProps {
  companyName: string;
  discordLink: string;
  recipient: {
    name: string;
    email: string;
  };
}

/**
 * Generates HTML content for the welcome email
 */
export function generateWelcomeEmailHtml(props: WelcomeEmailProps): string {
  const { companyName, discordLink, recipient } = props;
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
      <title>Welcome to the Vexa Beta Program!</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        h1 {
          color: #3B82F6;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #3B82F6;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Vexa Logo">
        </div>
        <div class="content">
          <h1>Welcome to the Vexa Beta Program!</h1>
          <p>Dear ${recipient.name},</p>
          <p>Thank you for verifying your email and joining our private beta program for Vexa - the AI meeting assistant that helps you get more from every meeting.</p>
          <p>As one of our early users, your feedback will be invaluable in shaping the future of Vexa. Here's what you can expect:</p>
          <ul>
            <li><strong>Early Access:</strong> You'll be among the first to experience our AI-powered meeting assistant.</li>
            <li><strong>Completely Free:</strong> The beta program is free of charge, giving you full access to our features.</li>
            <li><strong>Direct Support:</strong> Direct line to our team for assistance and feedback.</li>
            <li><strong>Shape the Product:</strong> Your input will directly influence our development roadmap.</li>
          </ul>
          <p>We're currently reviewing applications and will be onboarding users in batches. We'll reach out shortly with more details on next steps.</p>
          <p>In the meantime, feel free to join our <a href="${discordLink}" style="color: #3B82F6; text-decoration: underline;">Discord community</a> where you can connect with other beta users and our team.</p>
          <p>If you have any immediate questions, please don't hesitate to email me directly.</p>
          <p>Thanks for being part of our journey!</p>
          <p>Best regards,<br>
          Dmitry Grankin<br>
          Founder, Vexa<br>
          <a href="mailto:dmitry@vexa.ai" style="color: #3B82F6;">dmitry@vexa.ai</a></p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Vexa. All rights reserved.</p>
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
  const { companyName, discordLink, recipient } = props;
  
  return `
Welcome to the Vexa Beta Program!

Dear ${recipient.name},

Thank you for verifying your email and joining our private beta program for Vexa - the AI meeting assistant that helps you get more from every meeting.

As one of our early users, your feedback will be invaluable in shaping the future of Vexa. Here's what you can expect:

- Early Access: You'll be among the first to experience our AI-powered meeting assistant.
- Completely Free: The beta program is free of charge, giving you full access to our features.
- Direct Support: Direct line to our team for assistance and feedback.
- Shape the Product: Your input will directly influence our development roadmap.

We're currently reviewing applications and will be onboarding users in batches. We'll reach out shortly with more details on next steps.

In the meantime, feel free to join our Discord community (${discordLink}) where you can connect with other beta users and our team.

If you have any immediate questions, please don't hesitate to email me directly.

Thanks for being part of our journey!

Best regards,
Dmitry Grankin
Founder, Vexa
dmitry@vexa.ai
  `;
}

/**
 * Gets the welcome email configuration
 */
export function getWelcomeEmailConfig(props: WelcomeEmailProps) {
  return {
    email: {
      html: generateWelcomeEmailHtml(props),
      text: generateWelcomeEmailText(props),
      subject: "Welcome to the Vexa Beta Program",
      from: {
        name: "Dmitry from Vexa",
        email: "dmitry@vexa.ai"
      },
      to: [
        {
          name: props.recipient.name,
          email: props.recipient.email
        }
      ]
    }
  };
} 
 
 
 