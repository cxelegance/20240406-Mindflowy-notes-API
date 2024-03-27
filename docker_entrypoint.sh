#! /bin/sh

# This is the production entrypoint. All production-level dependencies should have been built into the production stage.
dumb-init node bin/server.js
