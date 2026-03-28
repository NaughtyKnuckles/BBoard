#!/usr/bin/env bash
set -euo pipefail

mapfile -t rejects < <(find . -type f \( -name '*.rej' -o -name '*.orig' \) -not -path './.git/*' | sort)

if [[ ${#rejects[@]} -eq 0 ]]; then
  echo "No .rej or .orig files to remove."
  exit 0
fi

echo "Removing reject artifacts:"
printf ' - %s\n' "${rejects[@]}"
rm -f "${rejects[@]}"
echo "Done."
