FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY shared/package.json ./shared/package.json
RUN npm ci
COPY frontend ./frontend
COPY shared ./shared
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4000
COPY package*.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY shared/package.json ./shared/package.json
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/frontend/dist ./frontend/dist
COPY frontend/public ./frontend/public
COPY backend ./backend
COPY shared ./shared
COPY seed ./seed
COPY scripts/create-admin.mjs scripts/seed.mjs ./scripts/
RUN mkdir -p backend/uploads && chown -R node:node /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","backend/index.js"]
