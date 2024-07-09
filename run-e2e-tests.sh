#!/bin/bash

# Stop any running Docker containers
docker-compose -f tools/docker-compose.yml down

# Start Docker containers
docker-compose -f tools/docker-compose.yml up -d

# Run tests
NODE_ENV=development jest --config ./tests/jest-e2e.json --runInBand --detectOpenHandles --forceExit
TEST_RESULT=$?

# Stop Docker containers
docker-compose -f tools/docker-compose.yml down

# Exit with the result of the tests
exit $TEST_RESULT
