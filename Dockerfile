# default port to run on.
ARG PORT=3001

# ---- deps: install dependencies only ----
FROM node:24.12.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# ---- builder: build the application ----
FROM node:24.12.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN npm run build

# ---- runner: minimal production image ----
FROM node:24.12.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Default location for the angles api. Read at container start (not build time),
# so overriding it with `-e ANGLES_API_URL=...` needs no rebuild.
ENV ANGLES_API_BASE_URL=http://127.0.0.1:3000
ENV ANGLES_API_BASE_PATH=/rest/api/v1.0

# default port to run on.
ARG PORT
ENV PORT=${PORT}

EXPOSE 3001/tcp

# add `/app/node_modules/.bin` to $PATH
ENV PATH=/app/node_modules/.bin:$PATH

# Next.js standalone output only ships the node_modules it actually traced,
# so the runtime image doesn't carry devDependencies or the full install tree.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# start app
CMD ["node", "server.js"]
