#!/usr/bin/env bash
# Repete localmente os passos do job `verify` de .github/workflows/ci.yml.
# Falha no primeiro erro e imprime um resumo no fim. O Sonar fica de fora (depende do GitHub).
set -uo pipefail
cd "$(dirname "$0")/.."

steps=()
started=$SECONDS

summary() {
  echo
  echo "== resumo do ci:local =="
  printf '%s\n' "${steps[@]}"
  echo "total: $((SECONDS - started))s"
}

run() {
  local name=$1
  shift
  local t=$SECONDS
  echo
  echo "== $name =="
  if "$@"; then
    steps+=("PASSOU  $name ($((SECONDS - t))s)")
  else
    steps+=("FALHOU  $name ($((SECONDS - t))s)")
    summary
    exit 1
  fi
}

run "Lint" npm run lint
run "Format check" npm run format:check
run "Typecheck" npm run typecheck
run "Tests (cobertura)" npm run test:cov
run "Build" npm run build

summary
echo "ci:local passou"
