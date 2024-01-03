#!/bin/bash

# Bring other scripts in path.
parent_dir=$(dirname "$0")
export PATH="$parent_dir:$PATH"

start=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
while true; do
  echo "Attempting checks in 10 seconds..."
  sleep 10
  if [ "$(count_pods.sh '' status.phase=Failed "$start")" -gt 0 ]; then
    echo "Some pods have failed."
    exit 1
  fi
  if [ "$(count_pods.sh frontend status.phase=Running)" -eq 0 ]; then
    echo "No frontend pods running."
    continue
  fi
  if [ "$(count_pods.sh backend status.phase=Running)" -eq 0 ]; then
    echo "No backend pods running."
    continue
  fi
  if [ "$(count_pods.sh db status.phase==Running "$start")" -gt 0 ]; then
    echo "Some db pods still running."
    continue
  fi
  echo "Deployment successeful."
  break
done
