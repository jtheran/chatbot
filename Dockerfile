# Usa la versión 22 de Node.js
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para aprovechar el cache de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Copia explícitamente el archivo .env si no se copió en el paso anterior
COPY .env .env

# Expone el puerto del backend
EXPOSE 3325

# Comando de inicio del contenedor
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && npm run start"]

