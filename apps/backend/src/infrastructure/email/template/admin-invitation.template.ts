/**
 * Template de email para invitación de administrador
 * Enviado por el superadmin al crear una nueva organización
 */

interface AdminInvitationData {
  adminEmail: string;
  organizationName: string;
  invitationLink: string;
  expiryDays: number;
}

export function generateAdminInvitationEmail(
  data: AdminInvitationData,
): string {
  const { adminEmail, organizationName, invitationLink, expiryDays } = data;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitación de Administrador - Biotasys</title>
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
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .message {
          font-size: 14px;
          color: #666;
          margin-bottom: 25px;
          line-height: 1.8;
        }
        .organization-box {
          background-color: #f9f9f9;
          border-left: 4px solid #A1B2FF;
          padding: 15px 20px;
          margin-bottom: 25px;
          border-radius: 4px;
        }
        .organization-box p {
          margin: 8px 0;
          font-size: 14px;
        }
        .organization-box strong {
          color: #A1B2FF;
        }
        .cta-button {
          display: inline-block;
          background: #A1B2FF;
          color: white;
          padding: 14px 40px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 25px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(67, 91, 204, 0.4);
        }
        .link-section {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 25px;
          text-align: center;
        }
        .link-section p {
          font-size: 12px;
          color: #888;
          margin-bottom: 8px;
        }
        .link-section code {
          display: block;
          background-color: white;
          padding: 10px;
          border-radius: 3px;
          font-size: 11px;
          word-break: break-all;
          color: #333;
          margin-bottom: 10px;
        }
        .expiry-notice {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 25px;
          font-size: 13px;
          color: #856404;
        }
        .expiry-notice strong {
          color: #c92a2a;
        }
        .footer {
          background-color: #f9f9f9;
          border-top: 1px solid #e0e0e0;
          padding: 25px 30px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer-links a {
          color: #A1B2FF;
          text-decoration: none;
          margin: 0 10px;
        }
        .divider {
          border: 0;
          border-top: 1px solid #e0e0e0;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="https://i.wpfc.ml/8n/gml890.png" alt="Biotasys Logo" />
          <h1>🔐 Invitación de Administrador</h1>
          <p>Bienvenido a Biotasys</p>
        </div>

        <!-- Content -->
        <div class="content">
          <p class="greeting">¡Hola!</p>

          <p class="message">
            Has sido invitado por el superadministrador de Biotasys para ser 
            administrador de la siguiente organización:
          </p>

          <!-- Organization Details -->
          <div class="organization-box">
            <p><strong>Organización:</strong> ${organizationName}</p>
            <p><strong>Email de acceso:</strong> ${adminEmail}</p>
            <p><strong>Rol:</strong> Administrador</p>
          </div>

          <p class="message">
            De clicar en el botón de abajo para aceptar esta invitación y configurar 
            tu contraseña. Podrás acceder a tu panel de administración desde el cual 
            podrás gestionar los usuarios of tu organización.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center;">
            <a href="${invitationLink}" class="cta-button">
              Aceptar Invitación y Crear Cuenta
            </a>
          </div>

          <!-- Alternative Link -->
          <div class="link-section">
            <p>O copia y pega este enlace en tu navegador:</p>
            <code>${invitationLink}</code>
          </div>

          <!-- Expiry Warning -->
          <div class="expiry-notice">
            <strong>⏰ Importante:</strong> Esta invitación expira en 
            <strong>${expiryDays} días</strong>. 
            Completa tu registro antes de que expire.
          </div>

          <p class="message">
            Si tienes problemas para acceder o preguntas, 
            contacta al soporte de Biotasys.
          </p>

          <p class="message" style="margin-bottom: 0;">
            Saludos,<br>
            <strong>El equipo de Biotasys</strong>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>
            Este es un email automático, por favor no respondas a esta dirección.
          </p>
          <p>
            © 2026 Biotasys. Todos los derechos reservados.
          </p>
          <p class="footer-links">
            <a href="https://biotasys.com">Sitio Web</a>
            <a href="https://biotasys.com/privacy">Privacidad</a>
            <a href="https://biotasys.com/terms">Términos</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
