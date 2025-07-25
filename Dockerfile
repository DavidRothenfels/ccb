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

# Copy the pre-built PocketBase binary
COPY pocketbase ./pocketbase
RUN chmod +x ./pocketbase

# Copy all PocketBase directories
COPY pb_data/ ./pb_data/
COPY pb_public/ ./pb_public/
COPY pb_hooks/ ./pb_hooks/
COPY pb_migrations/ ./pb_migrations/
COPY templates/ ./templates/


# Create directories if they don't exist
RUN mkdir -p /app/pb_data /app/pb_logs /app/templates

# Expose port
EXPOSE 8091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8091/api/health || exit 1

# Start PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8091"]