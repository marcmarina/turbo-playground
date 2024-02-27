FROM node:20-slim

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml turbo.json ./
COPY ./.yarn ./.yarn

COPY ./apps ./apps
COPY ./packages ./packages

RUN yarn install

RUN yarn build