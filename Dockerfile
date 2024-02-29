FROM node:20-slim AS build

WORKDIR /usr/src/app

COPY ./deps .

RUN yarn install

COPY ./apps ./apps
COPY ./packages ./packages

RUN yarn build

RUN yarn workspaces focus -A --production

FROM node:20-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package.json ./

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/packages ./packages
COPY --from=build /usr/src/app/apps ./apps
