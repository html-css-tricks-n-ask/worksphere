export const resetPasswordTemplate = (name: string, url: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .card { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { font-size: 11px; color: #94a3b8; margin-top: 30px; border-t: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password for your WorkSphere account. Click the button below to configure a new password:</p>
        <div style="text-align: center;">
          <a href="${url}" class="btn">Reset Password</a>
        </div>
        <p>If you did not make this request, you can ignore this email; your password will remain unchanged.</p>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="word-break: break-all;"><a href="${url}">${url}</a></p>
        <p>This password reset request expires in 1 hour.</p>
        <div class="footer">
          This is an automated message from WorkSphere.
        </div>
      </div>
    </body>
    </html>
  `;
};
export default resetPasswordTemplate;
