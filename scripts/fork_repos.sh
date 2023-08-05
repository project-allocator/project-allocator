#!/bin/bash

echo "Project Allocator v3"
echo "Utility Script for Forking Repositories"
echo "v1.0"
echo "------------------------------------------------------------"

echo "This script will fork the repositories on Digital-Garage-ICL"
echo "to your personal account/specified organisation so that"
echo "you can develop and deploy your own copy of project allocator."

echo "Please make sure you have met the following requirements:"
echo "* You have installed and logged in to the 'gh' GitHub CLI command."

read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
  echo "Aborting..."
  exit 1
fi

# Check if the commands are installed.
echo "Checking requirements..."
if ! command -v gh > /dev/null; then
  echo "Error: The 'gh' Github CLI command is not installed."
  exit 1
fi

# Check if the user is logged into the CLI.
echo "Checking login status..."
if ! gh auth status > /dev/null; then
  echo "Error: You are not logged in to Github CLI. Please run 'gh auth login' and try again."
  exit 1
fi

# Find out the owner to fork the repositories to from user input.
read -rp "Do you want to fork the repositories in your organisation account (y/n)?: " use_organisation
if [[ "$use_organisation" =~ ^[Yy]$ ]]; then
  read -rp "Enter your organisation account name: " organisation_name
  echo "This script will fork the repositories in your organistion $organisation_name."
else
  echo "This script will fork the repositories in your personal account."
fi

read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
    echo "Aborting..."
    exit 1
fi

# Get the original repository's owner.
echo "Retrieving the original repository's owner..."
original_repository_url="$(git config --get remote.origin.url)"
original_repository_url="${original_repository_url/\.git/}"
original_owner_name="$(echo "$original_repository_url" | cut -d '/' -f 4)"

# Fork the repositories in the specified owner.
echo "Forking the repositories to the specified owner..."
option="${organisation_name:+"--org=$orgnaisation_name"}"
gh repo fork "$original_owner_name/project-allocator-deploy" --clone=false $option
gh repo fork "$original_owner_name/project-allocator-frontend" --clone=false $option
gh repo fork "$original_owner_name/project-allocator-backend" --clone=false $option

# Set the current repository's origin to a forked repository.
echo "Updating the origin URL of this cloned repository..."
account_name="$(gh api user | jq -r '.login')"
owner_name="${organisation_name:-"$account_name"}"
git remote set-url origin "git@github.com:$owner_name/project-allocator-deploy.git"

echo "Forking repositories complete!"
