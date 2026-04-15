FROM node:22.6.0

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

COPY --chown=node:node . .

USER node

RUN rm -rf node_modules
RUN yarn cache clean && yarn && yarn add moment && yarn add vis-util && npm run build --prod --build-optimizer

RUN npm run compress:brotli

WORKDIR /app/dist
COPY --chown=node:node assets/MDO/client-assets/dist www/en/assets

#RUN npm install --production
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3004
CMD ["npm", "run", "serve:prod"]
