FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN corepack enable && corepack prepare pnpm@9.7.1 --activate
RUN pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
