import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const emailFrom = process.env.EMAIL_FROM;
  if (!resendClient || !emailFrom) {
    console.warn(
      "RESEND_API_KEY or EMAIL_FROM not set — email not sent:",
      subject
    );
    return;
  }
  await resendClient.emails.send({ from: emailFrom, to, subject, html });
}
