/**
 * Template de email para notificación de cambio de email
 * Enviado al email antiguo cuando el usuario cambia su email
 */

interface EmailChangedNotificationData {
  userFullName: string;
  oldEmail: string;
  newEmail: string;
}

export function generateEmailChangedNotificationTemplate(
  data: EmailChangedNotificationData,
): string {
  const { userFullName, oldEmail, newEmail } = data;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Cambio de Correo - Biotasys</title>
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
        .info-box {
          background-color: #f9f9f9;
          border: 2px solid #A1B2FF;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .info-item {
          margin-bottom: 15px;
          font-size: 14px;
        }
        .info-label {
          color: #A1B2FF;
          font-weight: 600;
          display: block;
          margin-bottom: 5px;
        }
        .info-value {
          color: #333;
          word-break: break-all;
          font-family: monospace;
          background-color: #f0f0f0;
          padding: 8px;
          border-radius: 4px;
        }
        .warning-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin-bottom: 25px;
          border-radius: 4px;
          font-size: 13px;
          color: #856404;
        }
        .warning-box strong {
          display: block;
          margin-bottom: 8px;
        }
        .footer {
          border-top: 1px solid #eee;
          padding: 20px 30px;
          background-color: #f9f9f9;
          font-size: 12px;
          color: #999;
          text-align: center;
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
          <h1>⚠️ Cambio de Correo Electrónico</h1>
          <p>Notificación de seguridad en tu cuenta Biotasys</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="greeting">
            Hola <strong>${userFullName}</strong>,
          </div>

          <div class="message">
            Te estamos notificando que el correo electrónico asociado a tu cuenta de <strong>Biotasys</strong> ha sido recientemente cambiado.
          </div>

          <!-- Info Box -->
          <div class="info-box">
            <div class="info-item">
              <span class="info-label">Correo Anterior:</span>
              <span class="info-value">${oldEmail}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nuevo Correo:</span>
              <span class="info-value">${newEmail}</span>
            </div>
          </div>

          <!-- Warning Box -->
          <div class="warning-box">
            <strong>🔒 Seguridad de tu Cuenta</strong>
            Si <strong>NO</strong> realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente. Tu cuenta podría haber sido comprometida.
          </div>

          <div class="message">
            Se ha enviado un email de verificación al nuevo correo electrónico. Deberás verificar tu nueva dirección para continuar usando tu cuenta.
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Este es un email de seguridad automático.</p>
            <p style="margin-top: 10px; color: #ccc;">© 2026 Biotasys. Todos los derechos reservados.</p>
            <div class="security-note">
              Si tienes preguntas o preocupaciones sobre la seguridad de tu cuenta, no dudes en contactarnos.
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
