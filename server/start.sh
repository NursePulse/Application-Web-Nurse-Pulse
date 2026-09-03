#!/usr/bin/env sh
cd "$(dirname "$0")/.." || exit 1
npx json-server server/db.json --port 3000
