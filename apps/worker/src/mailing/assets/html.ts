const base_url_email_confirm =
  'http://localhost:3000/auth/confirmation_email?token=';

const base_url_reset_password =
  'http://localhost:3000/auth/reset_password?token=';

export function getHtmlForEmailConfirmation(token: string): string {
  return `
 <!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Подтверждение почты</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
    <table role="presentation" width="100%" style="border-spacing: 0; border-collapse: collapse; padding: 0; margin: 0; width: 100%;">
      <tr>
        <td align="center" style="padding: 20px 0; background-color: #f9f9f9;">
          <table role="presentation" width="600" style="border-spacing: 0; border-collapse: collapse; max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px;">
            <!-- Header -->
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #4a90e2; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Подтверждение почты</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 20px; color: #333333; text-align: left; line-height: 1.5;">
                <p style="margin: 0 0 16px;">Здравствуйте!</p>
                <p style="margin: 0 0 16px;">
                  Спасибо за регистрацию! Чтобы подтвердить ваш адрес электронной почты, нажмите на кнопку ниже.
                </p>
                <p style="margin: 0 0 16px;">
                  Если вы не регистрировались у нас, просто проигнорируйте это письмо.
                </p>

                <!-- Button -->
                <p style="text-align: center; margin: 20px 0;">
                  <a href="${base_url_email_confirm}${token}" style="display: inline-block; padding: 12px 24px; color: #ffffff; background-color: #4a90e2; text-decoration: none; border-radius: 4px; font-size: 16px;">
                    Подтвердить почту
                  </a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="margin: 0;">
                  Если кнопка не работает, скопируйте и вставьте следующий адрес в браузер:
                </p>
                <p style="margin: 8px 0; color: #4a90e2; word-break: break-all;">
                  <a href="${base_url_email_confirm}${token}" style="color: #4a90e2; text-decoration: underline;">
                    ${base_url_email_confirm}${token}
                  </a>
                </p>
                <p style="margin: 0;">
                  &copy; 2024 Ваша компания. Все права защищены.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

export function getHtmlForPasswordReset(token: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7; color: #333;">

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <tr>
      <td align="center" style="padding: 20px; background-color: #4CAF50; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h1 style="font-size: 24px; margin: 0; color: #ffffff;">Password Reset Request</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.6; color: #333333;">
          Hello,
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333333;">
          Please enter your new password below and click "Submit" to reset it. If you didn’t request a password reset, please ignore this email.
        </p>

        <!-- Форма для ввода нового пароля -->
        <form action="${base_url_reset_password}${token}" method="POST" style="margin: 20px 0;">
          <label for="password" style="display: block; font-size: 16px; color: #333333; margin-bottom: 8px;">New Password:</label>
          <input type="password" id="password" name="password" required 
                 style="width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">

          <div style="text-align: center; margin-top: 20px;">
            <button type="submit" 
                    style="font-size: 16px; padding: 12px 24px; color: #ffffff; background-color: #4CAF50; border: none; border-radius: 5px; cursor: pointer;">
              Submit
            </button>
          </div>
        </form>

        <p style="font-size: 16px; line-height: 1.6; color: #333333;">
          If you’re having trouble with the form, please copy and paste the following link into your browser to reset your password:
        </p>
        <p style="font-size: 14px; color: #555555; word-break: break-all;">
          <a href="${base_url_reset_password}${token}" style="color: #4CAF50; text-decoration: none;">${base_url_reset_password}${token}</a>
        </p>
        <p style="font-size: 14px; color: #999999; margin-top: 20px;">
          This link will expire in 24 hours.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px; background-color: #f4f4f7; color: #777777; font-size: 12px;">
        <p style="margin: 0;">
          © 2024 Your Company. All rights reserved.
        </p>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
