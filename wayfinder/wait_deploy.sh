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
  if [ "$(count_pods frontend status.phase=Running)" -eq 0 ]; then
    echo "No frontend pods running."
    continue
  fi
  if [ "$(count_pods backend status.phase=Running)" -eq 0 ]; then
    echo "No backend pods running."
    continue
  fi
  if [ "$(count_pods db status.phase!=Succeeded "$start")" -gt 0 ]; then
    echo "Not all DB pods have succeeded."
    continue
  fi
  echo "Deployment successeful."
  break
done
