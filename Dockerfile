# 第一阶段：使用Node.js 18版本构建Vue项目
FROM node:18 as build-stage
WORKDIR /app

# 复制项目文件并安装依赖
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn run build

# 第二阶段：使用Nginx构建生产环境镜像
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]