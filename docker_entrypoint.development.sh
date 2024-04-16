#! /bin/sh

# This is the development entrypoint.
# For production, you would want to build development dependencies like below in a pre-production stage and do only production-level
# dependencies in your final delivery stage.

sh ./cleanup.sh
yarn policies set-version $YARN_VERSION
yarn
dumb-init node ace serve --watch -- --node-args=--inspect=$HOST
# tail -f ./docker_entrypoint.development.sh
