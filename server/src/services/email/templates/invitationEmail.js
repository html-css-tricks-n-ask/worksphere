export const invitationEmailTemplate = (name, activationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to WorkSphere - Setup Password</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .card { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        .footer { font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="color: #4f46e5;">Welcome to WorkSphere, ${name}!</h2>
        <p>You have been onboarded on the WorkSphere platform. To activate your employee portal and configure your password, please click the button below:</p>
        <p><a href="${activationUrl}" class="button">Setup Password & Activate Account</a></p>
        <p>If the button above does not work, copy and paste this URL into your browser:</p>
        <p>${activationUrl}</p>
        <p>This activation link is valid for 7 days.</p>
        <div class="footer">
          This is an automated invitation message from WorkSphere.
        </div>
      </div>
    </body>
    </html>
  `;
};
export default invitationEmailTemplate;
