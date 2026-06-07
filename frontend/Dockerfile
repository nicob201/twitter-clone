FROM node:22-alpine AS builder

ARG VITE_API_URL=http://localhost:3000

ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY tsconfig.base.json /

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
