#!/usr/bin/env bash
set -euo pipefail
# Avoid FROM :latest
if grep -R --include='Dockerfile' -nE 'FROM .*:latest' .; then
  echo "::error::Avoid FROM :latest in Dockerfiles"; exit 1
fi
# Secrets heuristic
if grep -RInE 'SECRET|PASSWORD|API_KEY' apps domains 2>/dev/null | grep -vE '\.env\.example|_test|spec'; then
  echo "::error::Potential secret in source. Use env vars."; exit 1
fi
