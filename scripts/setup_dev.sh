#!/bin/bash

echo "Project Allocator v3"
echo "Setup Script for Development Environment"
echo "v1.0"
echo "------------------------------------------------------------"

echo "This script will setup your development environment"
echo "by cloning necessary GitHub repositories and building/running development Docker images."

echo "Please make sure you have met the following requirements:"
echo "* You have installed the 'npm' or 'yarn' command."
echo "* You have installed the 'docker' command."
echo "* You have installed the 'docker compose' plugin."
echo "* You have Docker Daemon running in the background (e.g. Docker Desktop)."
echo "* You have setup SSH key for your GitHub account."

read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
  echo "Aborting..."
  exit 1
fi

# Check if the commands are installed.
echo "Checking requirements..."
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

# Pull or clone the repositories
echo "Pulling or cloning repositories..."
repository_dir="$(git rev-parse --show-toplevel | xargs basename)"
repository_url="$(git config --get remote.origin.url)"
frontend_repository_dir="${repository_dir/project-allocator-deploy/project-allocator-frontend}"
backend_repository_dir="${repository_dir/project-allocator-deploy/project-allocator-backend}"
frontend_repository_url="${repository_url/project-allocator-deploy/project-allocator-frontend}"
backend_repository_url="${repository_url/project-allocator-deploy/project-allocator-backend}"
(cd ../ && (git -C "$frontend_repository_dir" pull || git clone "$frontend_repository_url"))
(cd ../ && (git -C "$backend_repository_dir" pull || git clone "$backend_repository_url"))

# Build and run the docker containers
echo "Building and running containers..."
docker compose -f docker-compose.yaml up --build -d

# Create tables in the database
echo "Creating database tables..."
docker compose exec -it backend poetry run db reset --yes

# Seed the tables in the database
echo "Seeding the database tables..."
docker compose exec -it backend poetry run db seed --yes

# Install backend dependencies in local venv
echo "Installing backend dependencies..."
(cd ../project-allocator-backend && poetry install)

# Install frontend dependencies in local directory
echo "Installing frontend dependencies..."
(cd ../project-allocator-frontend && (npm install || yarn install))

# Auto-generate the frontend client scripts
echo "Generating the frontend client scripts..."
(cd ../project-allocator-frontend && (npm run generate || yarn generate))

# Open the browser
echo "Lauching the Open API documentation in browser..."

function open_url() {
  # Open the URL with the defaul browser (only works in Linux and Unix)
  if ! (xdg-open "$1" || sensible-browser "$1" || x-www-browser "$1" || gnome-open "$1" || open "$1") 2> /dev/null; then
    echo "Error: Cannot open browser from the terminal."
    echo "Try opening $1 with the browser of your choice."
  fi
}

open_url http://localhost:8000/docs
echo "Launching the frontend in browser..."
open_url http://localhost:3000

echo "Development environment setup complete!"
