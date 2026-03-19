## 🧬 Biotasys – Plataforma de Análisis de Microbiota
Biotasys es una aplicación fullstack para gestionar, interpretar y visualizar datos de microbiota, diseñada para que profesionales de la salud y usuarios técnicos puedan transformar resultados crudos en información clínicamente accionable.
​
La plataforma integra un frontend moderno con un backend API que centraliza autenticación, gestión de usuarios y manejo de informes.

## 🌟 Características principales
- Panel de control con visión general de pacientes, informes y estado del sistema.
- Autenticación de usuarios con sesiones protegidas y rutas privadas en el frontend.
​- Gestión de informes: carga, listado y consulta de resultados de microbiota (estructurado para integrarse con tu flujo de PDFs o JSONs).
​- UI responsiva pensada para uso en escritorio y tablet, con estilos basados en Tailwind CSS.
- Backend en Node.js + Express preparado para integrarse con una base de datos real y servicios externos.

## 🖼 Vista previa de la aplicación
### Pantalla Login
<img width="1918" height="867" alt="image" src="https://github.com/user-attachments/assets/9a2878bd-b3fc-4f82-ab2f-25e04347b823" />

### Dashboard Nutrisionista
<img width="1910" height="866" alt="image" src="https://github.com/user-attachments/assets/e4d2767c-c406-4397-8779-5268286e1feb" />

### Modal Para Solicitud de resultados en Dashboard Laboratorio
<img width="1918" height="865" alt="image" src="https://github.com/user-attachments/assets/501eab07-686a-4a23-903e-593e59a26a83" />



## 🧱 Arquitectura del proyecto

```
i006-biotasys-fullstack/
├── apps/
│   ├── backend/          # API Node.js (Express)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   ├── server.js     # Punto de entrada del servidor
│   │   └── package.json
│   └── frontend/         # Aplicación React
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── context/
│       │   └── services/
│       ├── index.html
│       └── package.json
└── README.md

```

## 🛠 Tecnologías utilizadas
### Frontend
- **React + TypeScript** como base del cliente.
- **Vite** para desarrollo rápido y build optimizado.
- ​**React Router** para la navegación entre login, dashboard e informes.
- ​**Tailwind CSS** para estilos utilitarios y diseño responsivo.
- **pnpm** como gestor de paquetes recomendado.​

### Backend
- **Node.js** como runtime principal.
- **Express** como framework HTTP para crear la API REST.
- **CORS y body-parser** para manejar peticiones desde el frontend y parseo de JSON.

## � Docker (Opcional)

### Usar Docker Compose para Desarrollo

```bash
# Iniciar ambos servicios con Docker
docker-compose up --build

# Detener los servicios
docker-compose down

# Reconstruir y empezar
docker-compose up --build --force-recreate
```

### Construir Imágenes Individuales

```bash
# Backend
cd apps/backend
docker build -t example-auth-backend .

# Frontend
cd apps/frontend
docker build -t example-auth-frontend .
```

### Docker para Producción

```bash
# Usar el stage de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## �🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (v18 o superior)
- pnpm (recomendado) o npm
- Docker y Docker Compose (opcional)

### 1. Instalar Dependencias

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend
pnpm install
```

### 2. Ejecutar las Aplicaciones

```bash
# Backend (en una terminal)
cd apps/backend
npm run dev
# → Corre en http://localhost:3000

# Frontend (en otra terminal)
cd apps/frontend
pnpm run dev
# → Corre en http://localhost:5173
```

### 🌐 Endpoints Principales
### Auth
- /auth/login (Autentica un usuario con email, contraseña y rol.)
- /auth/logout/ (Revoca el token)
- /auth/forgot-password (solicita nueva contraseña)
- 
### Users
- /users  (Post Registrar nuevos usuarios)
- /users (Get* obtiene lista de usuarios)
- /users/verify-email
- /users/{id} (Obtiene usuario)
- 
### Estudios
- /studies (POST Crear estudio)
- /studies (Obtener estudio)
- /studies/{id}/start-analysis
- /studies/{id}/upload-json ( Cargar estudio)

## 🧩 Flujo de autenticación y acceso
- El usuario accede a la pantalla de login desde el frontend.
- El formulario envía las credenciales al backend, que valida y responde con un token mock (lista para sustituir por JWT real).
- El frontend guarda el estado de sesión en un AuthProvider y protege las rutas sensibles (dashboard e informes).

```Usuario → Frontend → Backend → (base de datos/mock) → Backend → Frontend → Usuario```

## 📌 Roadmap técnico
- La base del proyecto está pensada para evolucionar hacia un entorno de producción para Biotasys:
- Integración con base de datos real (PostgreSQL, MongoDB, etc.).​
- Implementación de JWT con expiración y refresh tokens.
- Hashing de contraseñas con bcrypt y variables de entorno para secrets.
- Validación robusta de inputs (Joi/Zod) y sistema de roles y permisos para distintos tipos de usuarios.
- Tests unitarios y de integración, logging, auditoría y CI/CD.

## 🐛 Problemas Comunes y Soluciones

### "Port already in use"

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### "pnpm command not found"

```bash
# Instalar pnpm
npm install -g pnpm
```

### Error de CORS
Asegúrate que el backend tenga el middleware CORS configurado.
