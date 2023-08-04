#!/bin/bash

wf access env project-allocator dev
while true; do
  echo "Attempting in 10 seconds..."
  sleep 10
  pods_failed="$(kubectl get pods --field-selector=status.phase=Failed --output json | jq -j '.items | length')"
  pods_active="$(kubectl get pods --field-selector=status.phase!=Succeeded,status.phase!=Failed --output json | jq -j '.items | length')"
  if [ "$pods_failed" -gt 0 ]; then
    echo "Some pods have failed."
    break
  fi
  if [ "$pods_active" -eq 0 ]; then
    echo "All pods have been stopped."
    break
  fi
done


while true; do
  echo "Attempting in 10 seconds..."
  sleep 10
  frontend_running="$(kubectl get pods --selector=app.kubernetes.io/component=frontend --field-selector=status.phase=Running)"
  backend_running="$(kubectl get pods --selector=app.kubernetes.io/component=backend --field-selector=status.phase=Running)"
  db_not_succeeded="$(kubectl get pods --selector=app.kubernetes.io/component=db --field-selector=status.phase!=Succeeded)"
  if [ "$frontend_running" -eq 0 ]; then
    echo "No frontend pods running."
    continue
  fi
  if [ "$backend_running" -eq 0 ]; then
    echo "No backend pods running."
    continue
  fi
  if [ "$db_not_succeeded" -gt 0 ]; then
    echo "Not all DB pods have succeeded."
    continue
  fi
  echo "Deployment successeful."
  break
done
