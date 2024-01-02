#!/bin/bash

echo "Project Allocator v3"
echo "Utility Script for Retrieving Database Credentials"
echo "v1.0"
echo "------------------------------------------------------------"

echo "This script will retrieve the database credentials"
echo "so that you can directly access it via CLI or using a database client."

echo "Please make sure you have met the following requirements:"
echo "* You have installed the 'base64' command."
echo "* You have installed the 'kubctl' command."

read -rp "Do you wish to continue (y/n)?: " should_continue
if [[ ! "$should_continue" =~ ^[Yy]$ ]]; then
  echo "Aborting..."
  exit 1
fi

# Check if the commands are installed.
echo "Checking requirements..."
if ! command -v base64 > /dev/null; then
  echo "Error: The 'base64' command is not installed."
  exit 1
fi
if ! command -v kubectl > /dev/null; then
  echo "Error: The 'kubectl' command is not installed."
  exit 1
fi

# Get access to the application environment.
echo "Getting access to the application environment..."
wf access env project-allocator dev --role namespace.admin

# Get secrets from the cluster and decode them.
echo "Getting secrets from Kubernetes cluster..."
domain="$(kubectl get secret db-outputs -o jsonpath='{.data.SERVER_FQDN}' | base64 --decode)"
login="$(kubectl get secret db-outputs -o jsonpath='{.data.ADMINISTRATOR_LOGIN}' | base64 --decode)"
password="$(kubectl get secret db-outputs -o jsonpath='{.data.ADMINISTRATOR_PASSWORD}'  | base64 --decode)"

# Print out the result.
echo "------------------------------------------------------------"
echo "Your database is accessible at: postgresql://$login\@$domain:$password@$domain:5432/default?sslmode=require"
echo "------------------------------------------------------------"
echo "Server host: $domain"
# Azure PostgreSQL requires the username to be in the format of <login>@<domain>.
echo "Admin username: $login@$domain"
echo "Admin password: $password"
echo "Database name: default"
echo "Make sure to set SSL mode to 'require' on connection!"
