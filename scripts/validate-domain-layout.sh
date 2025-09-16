#!/usr/bin/env bash
set -euo pipefail
REQUIRED=("src" "docs" "tests" "deploy")
DENY=("src" "docs" "tests")

# deny at repo root
for bad in "${DENY[@]}"; do
  [ -d "./$bad" ] && { echo "::error::'$bad/' must live under a {domain}/"; exit 1; }
done

# domain candidates (non-dot)
DOMAINS=($(find . -maxdepth 1 -type d -not -name '.*' -not -name '.' -printf "%f\n"))
[ ${#DOMAINS[@]} -eq 0 ] && { echo "::error::No domain folder found at repo root"; exit 1; }

fail=0
for d in "${DOMAINS[@]}"; do
  [[ "$d" =~ ^(cli|scripts|deploy|tools|vscode-extension|.github|node_modules)$ ]] && continue
  [[ "$d" == -* ]] && continue
  for r in "${REQUIRED[@]}"; do
    [ -d "./$d/$r" ] || { echo "::error::Domain '$d' missing '$r/'"; fail=1; }
  done
done
exit $fail
