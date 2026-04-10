import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: "CVScan <onboarding@cv-scan.com>",
      to: [to],
      subject: "Welcome to CVScan! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CVScan!</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for signing up! We're excited to help you create a resume that stands out.
              </p>

              <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0; border-radius: 5px;">
                <p style="margin: 0; font-size: 16px;">
                  <strong>🎁 You have 3 free credits</strong> to get started!
                </p>
              </div>

              <p style="font-size: 16px; margin-bottom: 15px;">Here's what you can do:</p>
              <ul style="font-size: 16px; line-height: 1.8;">
                <li>Generate professional resume bullet points (1 credit)</li>
                <li>Create tailored cover letters (2 credits)</li>
                <li>Purchase more credits anytime - no subscription required</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard"
                   style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Need help? Just reply to this email - we're here to help!
              </p>

              <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                - The CVScan Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPaymentReceiptEmail(
  to: string,
  name: string,
  credits: number,
  amount: number
) {
  try {
    await resend.emails.send({
      from: "CVScan <billing@cv-scan.com>",
      to: [to],
      subject: "Payment Confirmed - Credits Added! ✅",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful!</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Your payment has been processed and your credits have been added to your account.
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Credits Purchased</td>
                    <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 600;">${credits} credits</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Amount Paid</td>
                    <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 600;">$${(amount / 100).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Date</td>
                    <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 600;">${new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard"
                   style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Start Creating
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Questions about your purchase? Just reply to this email.
              </p>

              <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                - The CVScan Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send receipt email:", error);
    return { success: false, error };
  }
}

export async function sendLowCreditsEmail(to: string, name: string, creditsRemaining: number) {
  try {
    await resend.emails.send({
      from: "CVScan <notify@cv-scan.com>",
      to: [to],
      subject: "Running Low on Credits",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Running Low on Credits</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                You currently have <strong>${creditsRemaining} credit${creditsRemaining === 1 ? '' : 's'}</strong> remaining.
              </p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Don't let your job search momentum stop! Purchase more credits to continue creating professional resume content.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/buy-credits"
                   style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Buy More Credits
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                - The CVScan Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send low credits email:", error);
    return { success: false, error };
  }
}
