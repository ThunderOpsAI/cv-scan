import { Resend } from "resend";
import { APP_NAME } from "@/lib/branding";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@cv-scan.com>`,
      to: [to],
      subject: `Welcome to ${APP_NAME}`,
      html: `
        <html>
          <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#07111f;padding:28px;border-radius:18px 18px 0 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:28px;">Welcome to ${APP_NAME}</h1>
            </div>
            <div style="background:#f8fafc;padding:28px;border-radius:0 0 18px 18px;">
              <p>Hi ${name},</p>
              <p>Your account is ready. You have 3 free credits to explore ATS scanning, writing support, and interview practice.</p>
              <p style="margin-top:24px;">The ${APP_NAME} team</p>
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

export async function sendPaymentReceiptEmail(to: string, name: string, credits: number, amount: number) {
  try {
    await resend.emails.send({
      from: `${APP_NAME} <billing@cv-scan.com>`,
      to: [to],
      subject: "Payment confirmed",
      html: `
        <html>
          <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#0f766e;padding:28px;border-radius:18px 18px 0 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:28px;">Credits added</h1>
            </div>
            <div style="background:#f8fafc;padding:28px;border-radius:0 0 18px 18px;">
              <p>Hi ${name},</p>
              <p>Your payment was successful and ${credits} credits were added to your ${APP_NAME} account.</p>
              <p>Amount paid: $${(amount / 100).toFixed(2)}</p>
              <p style="margin-top:24px;">The ${APP_NAME} team</p>
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
      from: `${APP_NAME} <notify@cv-scan.com>`,
      to: [to],
      subject: "Running low on credits",
      html: `
        <html>
          <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#b45309;padding:28px;border-radius:18px 18px 0 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:28px;">Low credit reminder</h1>
            </div>
            <div style="background:#f8fafc;padding:28px;border-radius:0 0 18px 18px;">
              <p>Hi ${name},</p>
              <p>You currently have ${creditsRemaining} credit${creditsRemaining === 1 ? "" : "s"} remaining in ${APP_NAME}.</p>
              <p style="margin-top:24px;">The ${APP_NAME} team</p>
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
