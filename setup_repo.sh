#!/bin/bash

echo "Project Allocator Setup Script for GitHub Repository"
echo "v1.0"
echo "----------------------------------------"


echo "This script will setup your GitHub Repository"
echo "to enable automatic deployment with Wayfinder and GitHub Workflow."

echo "Please make sure you have met the following requirements:"
echo "* You have installed the 'jq' command."
echo "* You have installed the 'pwgen' command."
echo "* You have installed and logged in to the 'gh' GitHub CLI command."
echo "* You have installed and logged in to the 'wf' Wayfinder CLI command."
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
if ! command -v pwgen > /dev/null; then
  echo "Error: The 'pwgen' command is not installed."
  exit 1
fi
if ! command -v gh > /dev/null; then
  echo "Error: The 'gh' Github CLI command is not installed."
  exit 1
fi
if ! command -v wf > /dev/null; then
  echo "Error: The 'wf' Wayfinder CLI command is not installed."
  exit 1
fi

# Check if the user is logged into the CLI.
echo "Checking login status..."
if ! gh auth status > /dev/null; then
  echo "Error: You are not logged in to Github CLI. Please run 'gh auth login' and try again."
  exit 1
fi
if [ "$(wf whoami | wc -l)" -eq 0 ]; then
  echo "Error: You are not logged in to Wayfinder CLI. Please run 'wf login' and try again."
  exit 1
fi

# Set the -e option to exit if any subsequent command fails
set -e

# Find out the workspace name from user input.
read -rp "Do you already have a Wayfinder workspace (y/n)?: " has_workspace
if [[ "$has_workspace" =~ ^[Yy]$ ]]; then
  echo "Now you are ready to setup your GitHub repository!"
  read -rp "Enter Wayfinder workspace name (2-5 unique alphanumeric): " workspace_name
else
  echo "This script will create a Wayfinder workspace for you."
  read -rp "Do you wish to continue (y/n)?: " should_continue
  if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
    echo "Aborting..."
    exit 1
  fi
  read -rp "Enter Wayfinder workspace name (2-5 unique alphanumeric): " workspace_name
  read -rp "Enter Wayfinder workspace summary (human readable string): " workspace_summary
  echo "Creating a workspace $workspace_name..."
  wf create "$workspace_name" summary="$workspace_summary"
  echo "Successfully created a workspace. Please visit the Wayfinder UI and create your application."
  exit 0
fi

# Find out the GitHub PAT from user input.
read -rp "Enter GitHub personal access token (classic with read-package scope): " github_token

# Find out the URL of the deploy repository.
repository_url="$(git config --get remote.origin.url)"
repository_url="${repository_url/\.git/}"
repository_name="$(echo "$repository_url" | cut -d '/' -f 5)"
full_repository_name="$(echo "$repository_url" | cut -d '/' -f 4,5)"

# Set the variables and secrets in GitHub Actions.
echo "Creating variables and secrets on GitHub repository..."
version="$(wf serverinfo -o json | jq -r .version.release)"
server="$(wf profiles show -o json | jq -r .endpoint)"
token="$(wf create wat "$repository_name" -w "$workspace_name" --reset-token --show-token)"
gh variable set WAYFINDER_VERSION --repo "$full_repository_name" --body "$version"
gh variable set WAYFINDER_SERVER --repo "$full_repository_name" --body "$server"
gh variable set WAYFINDER_WORKSPACE --repo "$full_repository_name" --body "$workspace_name"
gh secret set WAYFINDER_TOKEN --repo "$full_repository_name" --body "$token"

# Set the default Wayfinder workspace.
echo "Setting the default Wayfinder workspace..."
wf use workspace "$workspace_name"

# Assign the Wayfinder access token manage apps.
echo "Acquiring the Wayfinder access token..."
wf assign wayfinderrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role workspace.appmanager
wf assign wayfinderrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role workspace.dnsmanager
wf assign wayfinderrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role workspace.accessmanager
wf assign wayfinderrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role workspace.appdeployer

wf assign accessrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role cluster.deployment --cluster aks-stdnt1
wf assign accessrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role namespace.deployment --cluster aks-stdnt1 --namespace "$workspace_name"-project-allocator-dev

# Create a Kubernetes secret so that kubelet can pull our container image.
echo "Creating secrets on the Kubernetes cluster..."
export GITHUB_TOKEN="$github_token"
username="$(gh api user | jq -r '.login')"
# Get access to the kuberenetes namespace in order to create a Kubernetes secret.
wf access cluster to1.aks-stdnt1 --role namespace.admin --namespace "$workspace_name"-project-allocator-dev
# Delete the secret first in case it already exists.
kubectl delete secret ghcr-login-secret --namespace "$workspace_name"-project-allocator-dev > /dev/null 2>&1 || true
kubectl create secret docker-registry ghcr-login-secret --namespace "$workspace_name"-project-allocator-dev --docker-username="$username" --docker-password="$github_token" --docker-server=ghcr.io

# Generate and save random database credentials for Azure PostgreSQL.
echo "Generating and saving database credentials..."
# Server name must be lowercase alphanumeric.
server_name="$(pwgen -Ans 16 1)"
# Administrator login must be lowercase alphanumeric and cannot start with a number.
administrator_login="$(pwgen -As 1 1)$(pwgen -Ans 15 1)"
# Administrator password must be alphanumeric and contain uppercase letters.
administrator_password="$(pwgen -cns 32 1)"
sed "s/<SERVER_NAME>/$server_name/g;s/<ADMINISTRATOR_LOGIN>/$administrator_login/g;s/<ADMINISTRATOR_PASSWORD>/$administrator_password/g" wayfinder/db-template.yaml > wayfinder/db.yaml

echo "GitHub repository setup complete!"