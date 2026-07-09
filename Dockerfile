FROM node:22.13.0

RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

COPY --chown=node:node . .

USER node

RUN rm -rf node_modules \
    && yarn cache clean \
    && yarn install \
    && yarn add moment \
    && yarn add vis-util \
    && npm run build --prod --build-optimizer \
    && npm run compress:brotli \
    && rm -rf /home/node/.cache \
    && yarn cache clean \
    && npm cache clean --force

WORKDIR /app/dist

COPY --chown=node:node assets/MDO/client-assets/dist ./www/en/assets

# Install ONLY the runtime dependencies required by dist/package.json
RUN npm install --production \
    && npm cache clean --force

EXPOSE 3004

CMD ["npm", "run", "serve:prod"]