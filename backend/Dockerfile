FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy application source
COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

CMD ["node", "dist/main.js"]
