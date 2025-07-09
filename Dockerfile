# 1단계: 빌드 스테이지
FROM node:23-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# 2단계: 런타임 스테이지
FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist


CMD ["node", "dist/main"]