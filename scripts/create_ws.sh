#!/bin/bash

echo "Project Allocator v3"
echo "Utility Script for Creating Wayfinder Workspace"
echo "v1.0"
echo "------------------------------------------------------------"

echo "This script will create a new Wayfinder workspace"
echo "where you can host your copy of the Project Allocator."

echo "Please make sure you have met the following requirements:"
echo "* You have installed and logged in to the 'wf' Wayfinder CLI command."

read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
  echo "Aborting..."
  exit 1
fi

# Check if the commands are installed.
echo "Checking requirements..."
if ! command -v wf > /dev/null; then
  echo "Error: The 'wf' Wayfinder CLI command is not installed."
  exit 1
fi

# Check if the user is logged into the CLI.
echo "Checking login status..."
if [ "$(wf whoami | wc -l)" -eq 0 ]; then
  echo "Error: You are not logged in to Wayfinder CLI. Please run 'wf login' and try again."
  exit 1
fi

# Set the -e option to exit if any subsequent command fails
set -e

echo "This script will create a new Wayfinder workspace in your account."
read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
echo "Aborting..."
exit 1
fi
read -rp "Enter your Wayfinder workspace name (2-5 unique alphanumeric): " workspace_name
read -rp "Enter your Wayfinder workspace summary (human readable string): " workspace_summary
echo "Creating an empty workspace $workspace_name..."
wf create workspace "$workspace_name" --summary="$workspace_summary"
echo "Successfully created an empty workspace."
echo "You are ready to continue the instructions in README.md."
