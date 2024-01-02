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

# Build and run the docker containers
echo "Building and running containers..."
docker compose -f docker-compose.yaml up --build -d

# Create tables in the database
echo "Creating database tables..."
docker compose exec -it backend poetry run alembic downgrade base
docker compose exec -it backend poetry run alembic upgrade head

# Seed the tables in the database
echo "Seeding the database tables..."
docker compose exec -it backend poetry run db seed --yes

# Install backend dependencies in local venv
echo "Installing backend dependencies..."
(cd ./backend && poetry install)

# Install frontend dependencies in local directory
echo "Installing frontend dependencies..."
(cd ./frontend && (npm install || yarn install))

# Auto-generate the frontend client scripts
echo "Generating the frontend client scripts..."
(cd ./frontend && (npm run generate || yarn generate))

# Launch the frontend and OpenAPI documentation in browser
function open_url() {
  # Open the URL with the defaul browser (only works in Linux and Unix)
  if ! (xdg-open "$1" || sensible-browser "$1" || x-www-browser "$1" || gnome-open "$1" || open "$1") 2> /dev/null; then
    echo "Error: Cannot open browser from the terminal."
    echo "Try opening $1 with the browser of your choice."
  fi
}

echo "Launching the frontend in browser..."
open_url http://localhost:3000
echo "Lauching the OpenAPI documentation in browser..."
open_url http://localhost:8000/docs

echo "Development environment setup complete!"
