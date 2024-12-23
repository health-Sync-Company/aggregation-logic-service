# Use the official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the application source code
COPY . .

# Expose the port the application runs on
EXPOSE 8080

# Define the command to run the application
CMD ["npm", "start"]
