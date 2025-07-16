# Étape 1 : Build de l'app
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : Image finale pour servir les fichiers statiques
FROM node:20-alpine

WORKDIR /app

# Installe 'serve' pour servir le build React
RUN npm install -g serve

# Copie le build depuis l'étape précédente
COPY --from=build /app/build ./build

# Par défaut, Render expose le port 10000 pour les services web
ENV PORT 10000

# Commande de lancement
CMD ["serve", "-s", "build", "-l", "10000"]
