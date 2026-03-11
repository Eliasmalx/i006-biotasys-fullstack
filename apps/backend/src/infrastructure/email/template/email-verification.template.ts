/**
 * Template de email para verificación de email
 * Enviado durante el registro de usuario
 */

interface EmailVerificationData {
  userEmail: string;
  firstName: string;
  verificationLink: string;
  expiryMinutes: number;
}

export function generateEmailVerificationTemplate(
  data: EmailVerificationData,
): string {
  const {
    userEmail,
    firstName: fullName,
    verificationLink,
    expiryMinutes,
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica tu Email - Biotasys</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: #A1B2FF;
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header img {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .greeting strong {
          color: #A1B2FF;
        }
        .message {
          font-size: 14px;
          color: #666;
          margin-bottom: 25px;
          line-height: 1.8;
        }
        .verification-box {
          background-color: #f9f9f9;
          border: 2px solid #A1B2FF;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 25px;
          text-align: center;
        }
        .cta-button {
          display: inline-block;
          background: #A1B2FF;
          color: white !important;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-bottom: 15px;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .verification-link {
          font-size: 12px;
          color: #999;
          word-break: break-all;
          margin-top: 15px;
          padding: 10px;
          background-color: #f0f0f0;
          border-radius: 4px;
          font-family: monospace;
        }
        .expiry-info {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px 15px;
          margin-bottom: 25px;
          border-radius: 4px;
          font-size: 13px;
          color: #856404;
        }
        .footer {
          border-top: 1px solid #eee;
          padding: 20px 30px;
          background-color: #f9f9f9;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
        .footer-links {
          margin-top: 10px;
        }
        .footer-links a {
          color: #A1B2FF;
          text-decoration: none;
          margin: 0 10px;
        }
        .security-note {
          font-size: 12px;
          color: #999;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="https://i.wpfc.ml/8n/gml890.png" alt="Biotasys Logo" />
          <h1>¡Bienvenido a Biotasys!</h1>
          <p>Verifica tu dirección de correo electrónico para continuar</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="greeting">
            ¡Hola <strong>${fullName}</strong>!
          </div>

          <div class="message">
            Gracias por registrarte en <strong>Biotasys</strong>. Para completar tu registro y acceder a tu cuenta, necesitas verificar tu dirección de correo electrónico.
          </div>

          <!-- Expiry Info -->
          <div class="expiry-info">
            ⏰ Este enlace de verificación es válido durante <strong>${expiryMinutes} minutos</strong>. Después de este tiempo, deberás solicitar un nuevo enlace.
          </div>

          <!-- Verification Box -->
          <div class="verification-box">
            <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
              Haz clic en el botón siguiente para verificar tu email:
            </p>
            <a href="${verificationLink}" class="cta-button">
              Verificar Email
            </a>
            <div class="verification-link">
              O copia este enlace en tu navegador:<br>
              ${verificationLink}
            </div>
          </div>

          <!-- Security Note -->
          <div class="security-note">
            <strong>🔒 Seguridad:</strong> Si no realizaste este registro, ignora este email. Este enlace es personal y no debe ser compartido con otros usuarios.
          </div>

          <div class="message" style="font-size: 13px; margin-top: 20px;">
            Correo registrado: <strong>${userEmail}</strong>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>© 2026 Biotasys. Todos los derechos reservados.</p>
          <div class="footer-links">
            <a href="#">Política de Privacidad</a>
            <a href="#">Términos de Servicio</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
