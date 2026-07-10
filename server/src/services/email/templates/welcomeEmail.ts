export const welcomeEmailTemplate = (name: string, companyName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to WorkSphere</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .card { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .footer { font-size: 11px; color: #94a3b8; margin-top: 30px; border-t: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="color: #4f46e5;">Welcome to WorkSphere, ${name}!</h2>
        <p>Your administrator profile has been activated successfully, and <strong>${companyName}</strong> has been registered on our servers.</p>
        <p>You can now log in, complete your company settings profile, upload your branding logos, and start inviting HR coordinators and managers to your workspace.</p>
        <p>Thank you for choosing WorkSphere as your employee management dashboard.</p>
        <div class="footer">
          This is an automated welcome message from WorkSphere.
        </div>
      </div>
    </body>
    </html>
  `;
};
export default welcomeEmailTemplate;
