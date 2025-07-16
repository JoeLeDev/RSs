# Étape 1 : Image de base
FROM node:20-alpine

# Dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./
RUN npm install --production || npm install --production

# Installation des dépendances
RUN npm install --production

# Copie du code source
COPY . .

# Port exposé
ENV PORT 5001

# Démarrage du serveur (on lance server.js pour inclure Socket.io)
CMD ["node", "server.js"]
