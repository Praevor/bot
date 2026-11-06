#!/bin/sh
set -e

echo "Deploying..."
node dist/src/util/deploy.js

echo "Migrating db..."
./node_modules/.bin/drizzle-kit migrate

echo "Starting..."
exec node dist/src/index.js
