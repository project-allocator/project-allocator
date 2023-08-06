#!/bin/bash

# Generate the frontend client every minute.
# This process is run in the background.
while true; do 
  sleep 10
  yarn run openapi --input http://backend:8000/openapi.json --output ./src/api --client axios
done &

# Start the development server.
yarn dev --port 3000 --host 0.0.0.0
