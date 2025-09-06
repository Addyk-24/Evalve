# Build Stage
FROM node:18 AS builder

WORKDIR /app

# Install deps
COPY frontend/web/package.json frontend/web/package-lock.json ./
RUN npm install

# Copy code
COPY frontend/web/ .

# Build static files
RUN npm run build



# Expose port
EXPOSE 4000

CMD ["npm", "run", "dev"]
