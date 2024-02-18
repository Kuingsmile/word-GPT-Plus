# 第一阶段：使用Node.js 18版本构建Vue项目
FROM node:18-alpine3.19 as build-stage
WORKDIR /app

# 复制项目文件并安装依赖
COPY package.json yarn.lock ./
RUN yarn config set network-timeout 300000
RUN apk add g++ make py3-pip
RUN yarn global add node-gyp
RUN yarn install
COPY . .
RUN yarn run build

# 第二阶段：使用Nginx构建生产环境镜像
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]