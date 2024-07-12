# Use the official Node.js image as a base image for Node.js dependencies
FROM node:20 AS node_base

# Use the official Bun image as a base image for the final build
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lockb files
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Install Node.js version 20
COPY --from=node_base /usr/local/bin/node /usr/local/bin/
COPY --from=node_base /usr/local/lib/node_modules /usr/local/lib/node_modules/
COPY --from=node_base /usr/local/include/node /usr/local/include/node/

# Verify Node.js installation
RUN node -v

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "dev"]
