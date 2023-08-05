#!/bin/bash

# Wait for the backend server to be ready.
sleep 10

# Generate the frontend client every minute.
# This process is run in the background.
while true; do 
  yarn run openapi --input http://backend:8000/openapi.json --output ./src/api --client axios
  sleep 60
done &

# Start the development server.
yarn dev --port 3000 --host 0.0.0.0
