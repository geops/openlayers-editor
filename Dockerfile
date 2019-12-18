# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:12.13.1 as build-stage

WORKDIR /app

COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for serving with Nginx
FROM nginx:1.17.6-alpine
COPY ./src/index.html /usr/share/nginx/html/index.html
COPY --from=build-stage /app/build/ /usr/share/nginx/html

# Copy a default nginx.conf, taken from https://raw.githubusercontent.com/tiangolo/node-frontend/0a1ec453cd47c9c98370db3f546084e94ea5ac1e/nginx.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
