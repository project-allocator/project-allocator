#!/bin/bash

# shellcheck source=./count_pods.sh
source "$(dirname "$0")"/count_pods.sh

start=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
while true; do
  echo "Attempting checks in 10 seconds..."
  sleep 10
  if [ "$(count_pods '' status.phase=Failed "$start")" -gt 0 ]; then
    echo "Some pods have failed."
    exit 1
  fi
  if [ "$(count_pods '' status.phase!=Succeeded,status.phase!=Failed)" -gt 0 ]; then
    echo "Not all pods have terminated."
    continue
  fi
  echo "All pods have terminated."
  break
done
