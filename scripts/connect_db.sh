#!/bin/bash

echo "Retrieving secrets from Kubernetes cluster..."
domain="$(kubectl get secret db-outputs -o jsonpath='{.data.SERVER_FQDN}' | base64 --decode)"
login="$(kubectl get secret db-outputs -o jsonpath='{.data.ADMINISTRATOR_LOGIN}' | base64 --decode)"
password="$(kubectl get secret db-outputs -o jsonpath='{.data.ADMINISTRATOR_PASSWORD}'  | base64 --decode)"

echo "------------------------------------------------------------"
echo "Your database is accessible at: postgresql://$login\@$domain:$password@$domain:5432/default?sslmode=require"
echo "------------------------------------------------------------"
echo "Server host: $domain"
# Azure PostgreSQL requires the username to be in the format of <login>@<domain>.
echo "Admin username: $login@$domain"
echo "Admin password: $password"
echo "Make sure to set SSL mode to 'require' on connection!"
