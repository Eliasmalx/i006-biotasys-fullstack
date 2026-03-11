export const passwordResetEmailTemplate = (
  resetLink: string,
  userName: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restaurar Contraseña - Biotasys</title>
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
    .reset-link {
      font-size: 12px;
      color: #999;
      word-break: break-all;
      margin-top: 15px;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
    }
    .warning-box {
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
      <h1>🔐 Restaurar Contraseña</h1>
      <p>Solicitud de restablecimiento de contraseña</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hola <strong>${userName}</strong>,
      </div>

      <div class="message">
        Recibimos una solicitud para restaurar tu contraseña en <strong>Biotasys</strong>. 
        Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
      </div>

      <a href="${resetLink}" class="cta-button">Restaurar Contraseña</a>

      <div class="message" style="margin-top: 25px;">
        O copia y pega este enlace en tu navegador:
      </div>
      <div class="reset-link">${resetLink}</div>

      <!-- Warning Box -->
      <div class="warning-box">
        ⏰ Este enlace expira en <strong>15 minutos</strong> por razones de seguridad.
      </div>

      <div class="message">
        Si <strong>no</strong> solicitaste restaurar tu contraseña, ignora este email. Tu contraseña seguirá siendo la misma.
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Este es un email de seguridad automático.</p>
        <p style="margin-top: 10px; color: #ccc;">© 2026 Biotasys. Todos los derechos reservados.</p>
        <div class="security-note">
          Por favor, no respondas directamente a este email si tienes preguntas o preocupaciones.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
