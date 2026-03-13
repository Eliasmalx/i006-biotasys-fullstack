# Backend - Funcionalidades Implementadas

## 🔐 Autenticación (`/auth`)

- **Login** - Autentica usuario con email, contraseña y rol
  - Genera Access Token JWT (30 min) y Refresh Token (7 días)
  - Valida email verificado y usuario activo
  
- **Refresh Token** - Renovar access token sin credenciales
  - Valida refresh token no expirado y no revocado
  
- **Logout** - Cierra sesión revocando refresh token

- **Switch Role** - Cambiar rol de sesión entre nutricionista y laboratorio
  - Emite nuevos tokens sin reautenticación
  
- **Forgot Password** - Solicita reseteo de contraseña
  - Envía email con link y token (válido 15 min)
  - No revela si el usuario existe (seguridad)
  
- **Reset Password** - Resetea contraseña con token
  - Valida token no expirado y no utilizado
  - Hash bcrypt de nueva contraseña

---

## 👥 Usuarios (`/users`)

- **Register** - Crear nuevo usuario
  - Email único y verificable
  - Contraseña hasheada con bcrypt
  - Campo opcional de laboratorio
  - Envía email de verificación

- **Verify Email** - Verificar email del usuario
  - Token de 64 caracteres hexadecimales
  - Válido 24 horas
  - Habilita login tras verificación

- **Get Users** - Listar usuarios con filtros
  - Búsqueda por nombre, email o laboratorio
  - Paginación (página, límite)
  - Filtro por laboratorio para rol LABORATORIO
  - Ordenado por laboratorio y nombre

- **Get Laboratories** - Listar laboratorios disponibles
  - Para asignación de estudios
  - Solo usuarios con rol LABORATORIO

- **Get User by ID** - Obtener datos de usuario
  - Acceso solo a profesionales autenticados
  
- **Update User** - Modificar datos del usuario
  - Cambio de nombre, laboratorio
  - Solo por usuario autenticado o admin

- **Change Password** - Cambiar contraseña activa
  - Requiere contraseña anterior correcta
  - Validación de nueva contraseña

- **Delete User** - Eliminar usuario
  - Solo admin o el propio usuario

---

## 📋 Estudios (`/studies`)

- **Create Study** - Crear nuevo estudio
  - Solo nutricionista
  - Asigna laboratorio (usuario con rol LABORATORIO)
  - Estado inicial: SOLICITADO
  - Genera código único de estudio

- **List Studies** - Listar estudios con filtros
  - Nutricionista: ve sus estudios solicitados
  - Laboratorio: ve estudios asignados
  - Filtros por código, paciente, rango de fechas
  - Paginación y ordenamiento
  
- **Get Study Orders** - Órdenes de trabajo para laboratorio
  - Estudios en estado RECIBIDO
  - Ordenados por fecha
  
- **Get Study by ID** - Detalle de un estudio
  - Control de acceso por propietario/asignado
  - Relaciones: nutricionista, laboratorio, histórico

- **Receive Study** - Laboratorio recibe estudio
  - Transición: SOLICITADO → RECIBIDO
  - Registra timestamp de recepción
  
- **Start Analysis** - Inicia análisis del estudio
  - Transición: RECIBIDO → ANALIZANDO
  - Genera estado de procesamiento

- **Upload JSON** - Sube resultado de análisis
  - Procesa JSON con datos del estudio
  - Almacena en BD

- **Reject Study** - Rechaza estudio
  - Requiere motivo (nota)
  - Registra rechazo en histórico
  
- **Reassign Study** - Reasigna a otro laboratorio
  - Solo nutricionista
  - Anula asignación previa

- **Processing Result** - Envía resultado final
  - Webhook desde servicio de Python
  - Almacena resultado de IA
  - Transición: ANALIZANDO → COMPLETADO

---

## 🛡️ Seguridad

- **JWT Authentication** - Tokens con expiración
  - Access Token: 30 minutos
  - Refresh Token: 7 días
  - Payload: userId, email, rol
  
- **Role-Based Access Control (RBAC)**
  - Roles: NUTRICIONISTA, LABORATORIO, ADMIN
  - Guards por endpoint
  
- **Password Security**
  - Bcrypt hash con salt 10
  - Validación mínimo 8 caracteres
  
- **Email Verification**
  - Token aleatorio 64 caracteres
  - Expira en 24 horas
  - Previene acceso sin email verificado

- **CORS**
  - Configurable por dominio
  - Métodos: GET, POST, PUT, PATCH, DELETE

---

## 📧 Email

- **Verificación de Email** - Token único enviado
- **Reseteo de Contraseña** - Link con token de 15 min
- **SMTP Configurado** - Servidor de correos integrado

---

## 📊 Base de Datos

- **TypeORM** - ORM con PostgreSQL
- **Entidades**:
  - User (usuarios)
  - RefreshToken (tokens revocables)
  - PasswordResetToken (reseteos)
  - Study (estudios)
  - StudyStatusHistory (auditoría)
  - StudyProcessingJob (trabajos de análisis)
  - StudyCodeSequence (secuencia códigos)

---

## 🔧 Logging & Monitoring

- **Winston Logger** - Logs estructurados
  - Niveles: error, warn, info, debug
  - Archivos y consola

- **Morgan** - HTTP request logging
  - Registra método, URL, status code, duración

---

## 📡 API Documentation

- **Swagger/OpenAPI** - Documentación interactiva
  - Accesible en `/api/docs`
  - Todos los endpoints documentados
  - Ejemplos de request/response
  - Modelos TypeScript con descripciones

---

## ✅ Port & Config

- **Puerto**: 3000
- **Base URL**: http://localhost:3000
- **API Base**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs
- **.env**: Variables configurables (DB, JWT, SMTP, etc)
