#!/bin/bash

# Bring other scripts in path.
parent_dir=$(dirname "$0")
export PATH="$parent_dir:$PATH"

while true; do
  echo "Attempting checks in 10 seconds..."
  sleep 10
  if [ "$(count_pods.sh '' status.phase=Failed)" -gt 0 ]; then
    echo "Some pods have failed."
    exit 1
  fi
  if [ "$(count_pods.sh '' status.phase=Running)" -gt 0 ]; then
    echo "Some pods still running."
    continue
  fi
  if [ "$(count_pods.sh '' status.phase=Pending)" -gt 0 ]; then
    echo "Some pods still pending."
    continue
  fi
  echo "All pods have terminated."
  break
done
