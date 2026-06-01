FROM node:20-alpine

# Install yt-dlp and ffmpeg
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    && pip3 install --break-system-packages yt-dlp

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S streamdrop -u 1001
USER streamdrop

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
