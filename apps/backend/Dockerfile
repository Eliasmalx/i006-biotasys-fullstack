# Imagen base ligera con Node 18
FROM node:18-alpine AS development

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los package.json para instalar dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Comando por defecto: arrancar Nest en modo watch
CMD ["npm", "run", "start:dev"]
