FROM node:17.8.0 as build-stage

# Set service directory
WORKDIR /usr/rowlet

# Install Dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

# Copy over repo
COPY . .

# Build Application
RUN npm run build

# Configure nginx
FROM nginx

COPY --from=build-stage /usr/rowlet/build /usr/share/nginx/html
COPY --from=build-stage /usr/rowlet/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]