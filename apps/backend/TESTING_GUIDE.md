# 🚀 Cómo Crear un Superadministrador y Probar los Endpoints

## Paso 1: Asegúrate que el servidor está corriendo

```bash
npm run start:dev
```

Deberías ver:
```
[Nest] 1234 - 2026-02-20 10:30:00 [NestFactory] Starting Nest application...
[Nest] 1234 - 2026-02-20 10:30:01 [InstanceLoader] DatabaseModule dependencies initialized
```

## Paso 2: Crear un Superadministrador

Haz un POST request a este endpoint:

```
POST http://localhost:3000/api/dev/create-superadmin
Content-Type: application/json

{
  "email": "superadmin@biotasys.com",
  "password": "SuperAdmin123!",
  "fullName": "Mi Superadmin"
}
```

### Con cURL:

```bash
curl -X POST http://localhost:3000/api/dev/create-superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@biotasys.com",
    "password": "SuperAdmin123!",
    "fullName": "Mi Superadmin"
  }'
```

### Con Postman:

1. New Request → POST
2. URL: `http://localhost:3000/api/dev/create-superadmin`
3. Body → raw → JSON
4. Pega el JSON de arriba
5. Send

**Respuesta esperada:**

```json
{
  "message": "✅ Superadministrador creado exitosamente",
  "superadmin": {
    "id": "uuid-del-superadmin",
    "email": "superadmin@biotasys.com",
    "role": "superadmin"
  },
  "credentials": {
    "email": "superadmin@biotasys.com",
    "password": "SuperAdmin123!",
    "note": "Usa estos datos para hacer login en POST /api/auth/login"
  }
}
```

## Paso 3: Hacer Login y Obtener JWT

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@biotasys.com",
  "password": "SuperAdmin123!"
}
```

**Respuesta esperada:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid...",
    "email": "superadmin@biotasys.com",
    "role": "superadmin"
  }
}
```

Copia el `accessToken` para los siguientes requests.

## Paso 4: Probar Endpoints del Superadmin

Todos los endpoints necesitan el JWT en el header `Authorization`:

```
Authorization: Bearer {accessToken}
```

### 4.1 Crear una Organización e Invitar Admin

```
POST http://localhost:3000/api/superadmin/organizations
Content-Type: application/json
Authorization: Bearer {tu-jwt-de-arriba}

{
  "organizationName": "Clínica San Juan",
  "adminEmail": "admin@sanjuan.com"
}
```

**Respuesta:**

```json
{
  "message": "Organización creada e invitación enviada",
  "invitationToken": "ABC123DEF456..."
}
```

**⚠️ Guarda este token para el siguiente paso**

### 4.2 Listar Organizaciones

```
GET http://localhost:3000/api/superadmin/organizations
Authorization: Bearer {tu-jwt}
```

### 4.3 Ver Detalles de una Organización

```
GET http://localhost:3000/api/superadmin/organizations/{org-id}
Authorization: Bearer {tu-jwt}
```

### 4.4 Actualizar una Organización

```
PATCH http://localhost:3000/api/superadmin/organizations/{org-id}
Content-Type: application/json
Authorization: Bearer {tu-jwt}

{
  "name": "Clínica San Juan - actualizada",
  "status": "active"
}
```

### 4.5 Listar Invitaciones Pendientes

```
GET http://localhost:3000/api/superadmin/invitations
Authorization: Bearer {tu-jwt}
```

### 4.6 Revocar una Invitación

```
DELETE http://localhost:3000/api/superadmin/invitations/{invitation-id}
Authorization: Bearer {tu-jwt}
```

---

## 🔧 Con Postman (más fácil)

1. **Importar colección** (opcional):
   - File → Import
   - Pega la URL de tu colección Postman

2. **Crear un Environment:**
   - New Environment
   - Variables:
     - `base_url`: `http://localhost:3000`
     - `token`: (dejar vacío, se llena después del login)

3. **Requests en el siguiente orden:**
   - Create Superadmin
   - Login (copia el token a la variable `token`)
   - Create Organization
   - List Organizations
   - etc...

---

## ⚠️ IMPORTANTE: Desarrollo vs Producción

El endpoint `/api/dev/create-superadmin` **SOLO** debe estar disponible en desarrollo.

En producción, el superadmin debe crearse mediante:
- Una migración de BD
- Un script de seed ejecutado al desplegar
- CLI command autenticado

El `DevModule` debería deshabilitarse en `app.module.ts` para producción.

---

¿Necesitas ayuda con algo?
