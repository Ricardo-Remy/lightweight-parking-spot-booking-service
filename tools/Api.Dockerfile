FROM node:18.17.0

# Update and upgrade system packages
RUN apt-get update && apt-get upgrade -y

# Create a directory for the API
WORKDIR /usr/src/main

# Copy package.json, tsconfig.json, and yarn.lock
COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .

# Create a directory for output (if needed)
RUN mkdir output

# Install dependencies
RUN yarn install

# Copy the rest of the source code
COPY . .

# Build the project
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Define the command to start the application
CMD ["yarn", "start:prod"]