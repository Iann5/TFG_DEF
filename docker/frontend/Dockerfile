# ======= ETAPA 1: Build con Node =======
FROM node:20-alpine AS build

WORKDIR /app

# Como nuestro contexto es '.', copiamos desde la ruta frontend/
COPY frontend/package.json frontend/package-lock.json* ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código fuente del frontend
COPY frontend/ ./

# Compilamos la aplicación 
# (Nota: Vite genera la carpeta "dist". Si usaras Create React App, cambiaría a generar "build")
RUN npm run build 


# ======= ETAPA 2: Servidor Web con Nginx =======
FROM nginx:alpine

# Copiamos tu archivo nginx.conf para React Router
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos de la Etapa 1 a Nginx
# OJO: Si usas Create React App (sin Vite), cambia "/app/dist" a "/app/build"
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
