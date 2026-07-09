###############################################
# Stage 1 - Build
###############################################
FROM node:22.13.0 AS builder

WORKDIR /app

# Copy dependency files first (better Docker caching)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application source
COPY . .

# Build application
RUN yarn add moment vis-util \
    && npm run build --prod --build-optimizer \
    && npm run compress:brotli

# Clean caches
RUN yarn cache clean \
    && npm cache clean --force \
    && rm -rf /home/node/.cache


###############################################
# Stage 2 - Runtime
###############################################
FROM node:22-alpine

WORKDIR /app

# Copy only files required to run the application
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev \
    && npm cache clean --force

# Copy built Angular application
COPY --from=builder /app/dist ./dist

# Copy generated assets
COPY --from=builder /app/assets/MDO/client-assets/dist ./dist/www/en/assets

EXPOSE 3004

CMD ["npm", "run", "serve:prod"]