FROM node:17.8.0

# Set service directory
WORKDIR /usr/wario

# Build Application
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json

RUN npm ci

RUN npm run build

# Copy over repo
COPY . .

# Expose the listening port
EXPOSE 3001
