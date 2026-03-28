#!/usr/bin/env bash
set -euo pipefail

rejects=$(find . -type f \( -name '*.rej' -o -name '*.orig' \) -not -path './.git/*')

if [[ -z "${rejects}" ]]; then
  echo "No .rej or .orig files found."
  exit 0
fi

echo "Found unresolved patch artifact files:"
echo "${rejects}"
exit 1
