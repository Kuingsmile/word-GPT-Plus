# Keep the Node patch in sync with .node-version, .nvmrc and package.json.
FROM node:24.22.1-alpine3.24 AS build-stage
WORKDIR /app
ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/check-toolchain.mjs ./scripts/check-toolchain.mjs
RUN npm install --global "$(node -p 'require("./package.json").packageManager')" \
    && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 第二阶段：使用Nginx构建生产环境镜像
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
