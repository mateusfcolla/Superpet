# Use an official Node.js image as the base
FROM node:21-alpine3.17 AS builder

ENV NEXT_PUBLIC_SUPERPET_DELIVERY_URL=https://superpetdelivery.com.br


# Set the working directory within the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json ./ 
COPY package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the entire app directory to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Start a new stage from node
FROM node:21-alpine3.17

WORKDIR /app

# Copy over the built artifact from the previous stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install production dependencies
RUN npm ci --only=production

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]