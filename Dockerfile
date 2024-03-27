# syntax=docker/dockerfile:1

# ref: https://v5-docs.adonisjs.com/cookbooks/dockerizing-adonis

###
# create a small base stage that both development and production can be based off of
###
FROM node:20.6.0-alpine AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
ENV YARN_VERSION=1.22.21
ENV NODE_VERSION=20.6.0

###
# create dependencies stage for building the project; can develop from this stage
###
FROM base AS dependencies
COPY --chown=node:node --chmod=754 ./cleanup.sh ./
COPY --chown=node:node ./ ./

###
# create build stage: we build the project here for production
###
FROM dependencies AS build
RUN sh ./cleanup.sh
RUN yarn policies set-version $YARN_VERSION
RUN yarn --frozen-lockfile
RUN yarn build
COPY --chown=node:node ./.env ./build/

###
# create production stage for deployment: this is a small image with only the build contents, plus with production node_modules
###
FROM base AS production
COPY --chown=node:node --from=build /home/node/app/build ./
COPY --chown=node:node --chmod=754 ./docker_entrypoint.sh ./
RUN yarn policies set-version $YARN_VERSION
RUN yarn --production --frozen-lockfile
