FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 5000

# Use environment variable to determine mode
# Default to production, but can be overridden
CMD sh -c "if [ \"$NODE_ENV\" = \"production\" ]; then npm start; else npm run dev; fi"

