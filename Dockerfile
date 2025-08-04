# Dockerfile para el Sistema de Diagrama Unifilar Eléctrico
FROM node:18-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (todas, incluyendo dev dependencies)
# Esto es necesario porque Vite se usa en runtime para servir archivos estáticos
RUN npm ci && npm cache clean --force

# Copiar archivos de configuración del proyecto
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./
COPY components.json ./

# Copiar el código fuente
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# Construir la aplicación para producción
RUN npm run build

# Exponer el puerto que usa la aplicación
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
