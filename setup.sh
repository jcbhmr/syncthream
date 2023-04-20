#!/bin/bash
set -e

if ! command -v mkdocs &>/dev/null; then
  if command -v pipx &>/dev/null; then
    echo '🟪 Installing mkdocs using pipx...'
    pipx install mkdocs
    echo '🟩 Installed mkdocs'
  elif command -v pip &>/dev/null; then
    echo '🟪 Installing mkdocs using pip...'
    pip install mkdocs
    echo '🟩 Installed mkdocs'
  else
    echo '🟥 Neither pip nor pipx was found. Are you sure Python is installed?' >&2
    exit 1
  fi
else
  echo '🟦 mkdocs already installed'
fi
