/**
 * Centralized email templates.
 * Keeps HTML/Text content separate from job logic.
 */
export const emailTemplates = {
  verification: (url: string) => ({
    subject: "Verify your email address",
    html: `
      <p>Hello,</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
    text: `Please verify your email address: ${url}`,
  }),

  passwordReset: (url: string) => ({
    subject: "Reset your password",
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to verify your email address and set a new password:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    text: `Reset your password: ${url}`,
  }),
};
