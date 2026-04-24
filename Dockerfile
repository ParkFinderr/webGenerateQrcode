# 1. Base Stage
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# 2. Development Stage
FROM base AS development

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]


# 3. Builder Stage (for Production)
FROM base AS builder

RUN npm install

COPY . .

RUN npm run build


# 4. Production Stage
FROM node:18-alpine AS production
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-p", "8080"]
