FROM node:20.19-slim AS build

WORKDIR /usr/src/app

COPY ./deps .

RUN yarn install

COPY ./apps ./apps
COPY ./packages ./packages

RUN yarn build
RUN yarn workspaces focus -A --production

FROM node:20.19-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/ ./
