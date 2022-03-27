FROM node:17.8.0

# Set service directory
WORKDIR /usr/wario

# Build Application
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

# Copy over repo
COPY . .

# Expose the listening port
EXPOSE 3001

# TODO figure out prod/dev config
# Start application
CMD [ "npm", "run", "dev" ]