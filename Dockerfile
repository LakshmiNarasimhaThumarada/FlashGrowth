FROM node:20-slim

# Install Chromium and required Linux libraries for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root files
COPY package*.json ./
RUN npm install

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY . .

# Build typescript for server
WORKDIR /app/server
RUN npm run prisma:generate
RUN npm run build

# Start both services
CMD ["npm", "start"]