FROM alpine:3.19

# Install minimal dependencies
RUN apk add --no-cache \
    ca-certificates \
    wget \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Download PocketBase for the correct architecture
ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then \
        wget -O pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.28.4/pocketbase_0.28.4_linux_arm64.zip; \
    else \
        wget -O pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.28.4/pocketbase_0.28.4_linux_amd64.zip; \
    fi && \
    unzip pocketbase.zip && \
    rm pocketbase.zip && \
    chmod +x ./pocketbase

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
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8091/api/health || exit 1

# Start PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8091"]