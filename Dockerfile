# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install 'serve' package to serve static files
RUN npm install -g serve

# Copy everything (except what's in .dockerignore if it existed)
COPY . .

# Build the web app (Static Export)
RUN npm install
RUN npx expo export --platform web

# Expose port 8080 as required by Cloud Run
EXPOSE 8080

# Command to serve the 'dist' directory on port 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
