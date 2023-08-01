#!/bin/bash

function open_url() {
  # Open the URL with the defaul browser (only works in Linux and Unix)
  xdg-open "$1" || sensible-browser "$1" || x-www-browser "$1" || gnome-open "$1" || open "$1" \
  || echo "Error: Cannot open browser from the terminal."
  echo "Try opening $1 with the browser of your choice."
  return 0
}

function setup_dev() {
  echo "Setting up development environment..."

  echo "Please make sure you have met the following requirements:"
  echo "* You have installed the 'npm' or 'yarn' command."
  echo "* You have installed the 'docker' command."
  echo "* You have installed the 'docker compose' plugin."
  echo "* You have Docker Daemon running in the background (e.g. Docker Desktop)."
  echo "* You have setup SSH key for your GitHub account."

  read -rp "Do you wish to continue (yes/no)?: " should_continue
  if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
    echo "Aborting..."
    exit 1
  fi

  # Check if the commands are installed.
  if ! command -v docker &>/dev/null; then
    echo "Error: The 'docker' command is not installed." >&2
    exit 1
  fi
  if ! docker compose version &> /dev/null; then
    echo "Error: The 'docker compose' plugin is not installed." >&2
    exit 1
  fi

  # Set the -e option to exit if any subsequent command fails
  set -e

  # Clone the repositories
  echo "Cloning repositories..."
  repository_url=$(git config --get remote.origin.url)
  frontend_repository_url="${repository_url/project-allocator-deploy/project-allocator-frontend}"
  backend_repository_url="${repository_url/project-allocator-deploy/project-allocator-backend}"
  (cd ../ && git clone "$frontend_repository_url")
  (cd ../ && git clone "$backend_repository_url")

  # Build and run the docker containers
  echo "Building and running containers..."
  docker compose up -f docker-compose.yaml --build -d

  # Create tables in the database
  echo "Creating database tables..."
  docker compose exec -it backend poetry run db reset --yes

  # Seed the tables in the database
  echo "Seeding the database tables..."
  docker compose exec -it backend poetry run db seed --yes

  # Auto-generate the frontend client scripts
  echo "Generating the frontend client scripts..."
  (cd ../project-allocator-frontend && (npm run generate || yarn generate))

  # Open the browser
  echo "Lauching the Open API documentation in browser..."
  open_url http://localhost:8000/docs
  echo "Launching the frontend in browser..."
  open_url http://localhost:3000

  echo "Development environment setup complete!"
  return 0
}

function setup_repo() {
  echo "Setting up GitHub repository..."
  
  echo "Please make sure you have met the following requirements:"
  echo "* You have installed the 'jq' command."
  echo "* You have installed and logged in to the 'gh' GitHub CLI command."
  echo "* You have installed and logged in to the 'wf' Wayfinder CLI command."
  echo "* You have installed the 'kubctl' command."
  
  read -rp "Do you wish to continue (yes/no)?: " should_continue
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

  # Get the inputs from terminal.
  read -rp "Do you already have a Wayfinder workspace (yes/no)?: " has_workspace
  if [[ "$has_workspace" =~ ^[Yy]$ ]]; then
    echo "Now you are ready to setup your GitHub repository!"
    read -rp "Enter Wayfinder workspace name (2-5 unique alphanumeric): " workspace_name
  else
    echo "This script will create a Wayfinder workspace for you."
    read -rp "Do you wish to continue (yes/no)?: " should_continue
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
  read -rp "Enter Wayfinder application name: " application_name
  read -rp "Enter Wayfinder environment name: " environment_name
  read -rp "Enter Wayfinder frontend component name: " frontend_component_name
  read -rp "Enter Wayfinder backend component name: " backend_component_name
  read -rp "Enter GitHub personal access token (classic with read-package scope): " github_token

  # Find out the URL of the deploy repository
  repository_url=$(git config --get remote.origin.url)
  repository_name=$(echo "$repository_url" | cut -d '/' -f 5)
  full_repository_name=$(echo "$repository_url" | cut -d '/' -f 4,5)

  # Set the variables and secrets in GitHub Actions.
  echo "Creating variables and secrets on GitHub repository..."
  version=$(wf serverinfo -o json | jq -r .version.release)
  server=$(wf profiles show -o json | jq -r .endpoint)
  token=$(wf create wat "$repository_name" -w "$workspace_name" --reset-token --show-token)
  gh variable set WAYFINDER_VERSION --repo "$full_repository_name" --body "$version"
  gh variable set WAYFINDER_SERVER --repo "$full_repository_name" --body "$server"
  gh variable set WAYFINDER_WORKSPACE --repo "$full_repository_name" --body "$workspace_name"
  gh variable set WAYFINDER_APPLICATION --repo "$full_repository_name" --body "$application_name"
  gh variable set WAYFINDER_ENVIRONMENT --repo "$full_repository_name" --body "$environment_name"
  gh variable set WAYFINDER_FRONTEND_COMPONENT --repo "$full_repository_name" --body "$frontend_component_name"
  gh variable set WAYFINDER_BACKEND_COMPONENT --repo "$full_repository_name" --body "$backend_component_name"
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
  wf assign accessrole --workspace "$workspace_name" --workspace-access-token "$repository_name" --role namespace.deployment --cluster aks-stdnt1 --namespace "$workspace_name"-"$application_name"-"$environment_name"  

  # Create a Kubernetes secret so that kubelet can pull our container image.
  echo "Creating secrets on the Kubernetes cluster..."
  export GITHUB_TOKEN=$github_token
  username=$(gh api user | jq -r '.login')
  # Get access to the kuberenetes namespace in order to create a Kubernetes secret.
  wf access cluster to1.aks-stdnt1 --role namespace.admin --namespace "$workspace_name"-"$application_name"-"$environment_name"
  # Delete the secret first in case it already exists.
  kubectl delete secret ghcr-login-secret --namespace "$workspace_name"-"$application_name"-"$environment_name" > /dev/null 2>&1 || true
  kubectl create secret docker-registry ghcr-login-secret --namespace "$workspace_name"-"$application_name"-"$environment_name" --docker-username="$username" --docker-password="$github_token" --docker-server=ghcr.io

  echo "GitHub repository setup complete!"
  return 0
}

echo "Project Allocator Setup Script"
echo "v1.0"
echo "----------------------------------------"

if [ "$#" -ne 1 ]; then
  if [ "$#" -eq 0 ]; then
    echo "Error: Missing command."
  else
    echo "Error: Too many arguments."
  fi
  echo "Usage:"
  echo "$0 dev"
  echo "$0 repo"
  exit 1
fi

case "$1" in
  dev)
    setup_dev
    exit 0
    ;;
  repo)
    setup_repo
    exit 0
    ;;
  *)
    echo "Error: Unknown command: $1"
    exit 1
    ;;
esac
