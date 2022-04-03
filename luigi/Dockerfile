FROM node:17.8.0

# Set service directory
WORKDIR /usr/luigi

# Build Application
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

# Copy over repo
COPY . .

# Expose the listening port
EXPOSE 5001
