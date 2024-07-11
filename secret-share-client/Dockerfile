# Use the official Node.js image as the base image for building the app
FROM node:20 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Use the official NGINX image to serve the built app
FROM nginx:1.27.0-alpine

# Copy the built app from the previous stage to the NGINX html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom NGINX configuration file
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80 to the outside world
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]



