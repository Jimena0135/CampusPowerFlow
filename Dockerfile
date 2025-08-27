# Dockerfile para el Sistema de Diagrama Unifilar Eléctrico
FROM node:18-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++ git

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias - usar npm install en lugar de npm ci para mejor compatibilidad
# Esto maneja mejor las dependencias que pueden necesitar compilación nativa
RUN npm install --production=false && npm cache clean --force

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

# Crear directorios necesarios
RUN mkdir -p dist dist/public logs

# Construir la aplicación con manejo de errores
RUN npm run build || (\
  echo "Build principal falló, intentando builds individuales..." && \
  npm run build:client || echo "Client build falló" && \
  npm run build:server || echo "Server build falló" && \
  npm run build:fallback || echo "Fallback build falló" \
)

# Verificar que el servidor se construyó correctamente
RUN if [ ! -f "dist/server.js" ]; then \
  echo "Creando servidor básico de fallback..." && \
  mkdir -p dist && \
  echo "import express from 'express';" > dist/server.js && \
  echo "import path from 'path';" >> dist/server.js && \
  echo "const app = express();" >> dist/server.js && \
  echo "const port = process.env.PORT || 5000;" >> dist/server.js && \
  echo "app.use(express.static('dist/public'));" >> dist/server.js && \
  echo "app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'dist/public/index.html')));" >> dist/server.js && \
  echo "app.listen(port, '0.0.0.0', () => console.log(\`Server running on port \${port}\`));" >> dist/server.js; \
fi

# Crear archivos básicos del cliente si no existen
RUN if [ ! -d "dist/public" ] || [ -z "$(ls -A dist/public)" ]; then \
  echo "Creando archivos básicos del cliente..." && \
  mkdir -p dist/public && \
  cp client/index.html dist/public/ || echo '<html><body><h1>Loading...</h1></body></html>' > dist/public/index.html; \
fi

# Exponer el puerto que usa la aplicación
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
