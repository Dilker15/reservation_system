


FROM node:24.6.0-alpine3.22 AS dependencies
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci



FROM node:24.6.0-alpine3.22 AS testing
WORKDIR /app
COPY . ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run test


FROM node:24.6.0-alpine3.22 AS prebuild
WORKDIR /app
COPY . ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build


FROM node:24.6.0-alpine3.22 AS build_production
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --omit=dev
COPY --from=prebuild /app/dist /app/dist
CMD ["node","dist/main.js"]



