FROM alpine:3.19

# Install required packages
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    curl \
    bash

# Create app directory
WORKDIR /app

# Download and install PocketBase
ARG POCKETBASE_VERSION=0.28.4
RUN wget -O pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip \
    && unzip pocketbase.zip \
    && rm pocketbase.zip \
    && chmod +x pocketbase

# Copy application files
COPY pocketbase /app/pocketbase
COPY pb_data /app/pb_data
COPY pb_public /app/pb_public
COPY pb_hooks /app/pb_hooks
COPY pb_migrations /app/pb_migrations
COPY templates /app/templates
COPY start_pocketbase.sh /app/start_pocketbase.sh

# Make start script executable
RUN chmod +x /app/start_pocketbase.sh

# Create directories if they don't exist
RUN mkdir -p /app/pb_data /app/pb_logs /app/templates

# Expose port
EXPOSE 8091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8091/api/health || exit 1

# Start PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8091", "--dir=/app/pb_data"]