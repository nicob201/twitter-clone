FROM node:22-alpine

WORKDIR /app/backend

COPY tsconfig.base.json /app/
COPY backend/package.json backend/tsconfig.json backend/tsconfig.build.json ./

RUN npm install

COPY backend/prisma ./prisma/
COPY backend/prisma.config.ts ./
COPY backend/src ./src/
COPY backend/seed-assets ./seed-assets/

RUN DATABASE_URL=postgresql://p:p@localhost:5432/p npx prisma generate
RUN npm run build
RUN mkdir -p uploads

COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
