#!/bin/bash

# Exit on error
chmod +x start.sh

bash start.sh

docker compose --env-file .env.production logs -f
