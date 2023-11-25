#!/bin/bash

if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "Missing Sentry Auth Token, skipping...";
    exit 0;
fi
if [ -z "$SENTRY_ORG" ]; then
    echo "Missing Sentry Organization, skipping...";
    exit 0;
fi
if [ -z "$SENTRY_PROJECT" ]; then
    echo "Missing Sentry Project, skipping...";
    exit 0;
fi
echo "Setting up dist for Sentry..."
npx sentry-cli sourcemaps inject ./dist
npx sentry-cli sourcemaps upload --release="$(git rev-parse HEAD)" ./dist