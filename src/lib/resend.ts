import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend();
  if (!resend) {
    console.warn('Resend API key not configured — skipping welcome email');
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@worknest.app',
      to: email,
      subject: 'Welcome to WorkNest 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A1828; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #178582; font-size: 28px; margin-bottom: 8px;">Welcome to WorkNest</h1>
          <p style="color: #a1a1aa; font-size: 16px; margin-bottom: 24px;">Your team's daily command center.</p>
          <p style="font-size: 16px;">Hi ${name},</p>
          <p style="font-size: 16px; color: #d4d4d8;">Your account has been created successfully. You can now access all WorkNest features including task management, team chat, leave requests, and more.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #178582; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">Go to Dashboard →</a>
          <p style="color: #71717a; font-size: 14px; margin-top: 32px;">WorkNest — Your team's daily command center.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendLeaveApprovalEmail(
  email: string,
  name: string,
  status: 'APPROVED' | 'REJECTED',
  leaveType: string,
  startDate: string,
  endDate: string,
  comments?: string
) {
  const resend = getResend();
  if (!resend) {
    console.warn('Resend API key not configured — skipping leave email');
    return;
  }
  const isApproved = status === 'APPROVED';
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@worknest.app',
      to: email,
      subject: `Leave Request ${isApproved ? 'Approved' : 'Rejected'} — WorkNest`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A1828; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: ${isApproved ? '#BFA181' : '#EF4444'}; font-size: 24px;">Leave Request ${isApproved ? 'Approved ✓' : 'Rejected ✗'}</h1>
          <p>Hi ${name},</p>
          <p style="color: #d4d4d8;">Your <strong>${leaveType}</strong> leave request from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
          ${comments ? `<p style="color: #a1a1aa; background: #0D1F35; padding: 12px; border-radius: 8px; border-left: 3px solid #178582;">Manager's note: ${comments}</p>` : ''}
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/leaves" style="display: inline-block; background: #178582; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">View Leave Details →</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send leave approval email:', error);
  }
}
