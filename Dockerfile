#######################
## development stage ##
#######################
FROM node:19.0.1 AS development

RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

USER node

WORKDIR /app

COPY --chown=node package.json package-lock.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

RUN npm install

COPY --chown=node . .

RUN npm run build

CMD ["npm", "run", "dev"]

######################
## production stage ##
######################
FROM node:19.0.1 AS production

RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

USER node

WORKDIR /app

COPY --chown=node --from=development /app/dist ./dist
COPY --chown=node --from=development /app/package.json /app/package-lock.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

RUN npm ci --only=production

CMD ["node", "dist/server.js"]
