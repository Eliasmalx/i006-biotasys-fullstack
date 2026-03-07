export const passwordResetEmailTemplate = (
  resetLink: string,
  userName: string,
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .content { background-color: white; padding: 30px; border-radius: 8px; }
    .header { color: #333; margin-bottom: 20px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
    .warning { color: #d9534f; background-color: #f2dede; padding: 10px; border-radius: 4px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2 class="header">🔐 Restaurar Contraseña</h2>
      
      <p>Hola <strong>${userName}</strong>,</p>
      
      <p>Recibimos una solicitud para restaurar tu contraseña en Biotasys. 
      Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.</p>
      
      <a href="${resetLink}" class="button">Restaurar Contraseña</a>
      
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;"><code>${resetLink}</code></p>
      
      <div class="warning">
        <strong>⚠️ Nota importante:</strong> Este enlace expira en 15 minutos por razones de seguridad.
      </div>
      
      <p>Si <strong>no</strong> solicitaste restaurar tu contraseña, ignora este email. Tu contraseña seguirá siendo la misma.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
      <div class="footer">
        <p>&copy; 2026 Biotasys. Todos los derechos reservados.</p>
        <p>Este es un email automatizado. Por favor, no respondas directamente.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
