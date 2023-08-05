#!/bin/bash

echo "Project Allocator v3"
echo "Utility Script for Entering Pod Containers"
echo "v1.0"
echo "------------------------------------------------------------"

if [ "$#" != 1 ]; then
  echo "Error: Invalid number of arguments."
  echo "Usage:"
  echo "$0 frontend"
  echo "$0 backend"
  exit 1
fi

echo "This script will get shell access to a running pod container"
echo "of the specified component so that you can inspect and debug your application."

echo "Please make sure you have met the following requirements:"
echo "* You have installed the 'jq' command."
echo "* You have installed the 'kubctl' command."

read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
  echo "Aborting..."
  exit 1
fi

# Check if the commands are installed.
echo "Checking requirements..."
if ! command -v jq > /dev/null; then
  echo "Error: The 'jq' command is not installed."
  exit 1
fi
if ! command -v kubectl > /dev/null; then
  echo "Error: The 'kubectl' command is not installed."
  exit 1
fi

# Get access to the application environment.
echo "Getting access to the application environment..."
wf access env project-allocator dev --role namespace.admin

# Check the number of running pods.
echo "Checking the number of running pods..."
pod_count="$(kubectl get pods --selector=app.kubernetes.io/component="$1" --output json| jq -r '[.items[]] | length')"
if [ "$pod_count" -eq 0 ]; then
  echo "Error: No $1 pods running."
  exit 1
fi

# Otherwise pick a running pod from the list.
echo "Picking a running pod from $pod_count $1 pod(s)..."
pod_name="$(kubectl get pods --selector=app.kubernetes.io/component="$1" --output json | jq -r '.items[0].metadata.name')"

# Enter the pod container with bash.
echo "Entering the pod container..."
kubectl exec --stdin --tty "$pod_name" -- /bin/bash
