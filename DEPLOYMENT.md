# CityChallenge Deployment Guide

## GitHub Secrets Configuration

To enable automated deployment, configure these secrets in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secret:
   - **COOLIFY_WEBHOOK_URL**: The webhook URL from your Coolify deployment

> Note: The `GITHUB_TOKEN` is automatically provided by GitHub Actions for container registry access.

## Coolify Setup

1. **In Coolify Dashboard:**
   - Click "New Resource"
   - Select "Docker Compose"
   - Choose "Public Repository"
   - Enter your GitHub repository URL
   - Set branch to `main`
   - Set Docker Compose location to `/docker-compose.coolify.yml`

2. **After Creation:**
   - Go to the deployment settings
   - Copy the webhook URL
   - Add it as `COOLIFY_WEBHOOK_URL` in GitHub secrets

3. **First Deployment:**
   - Push to main branch or manually trigger the GitHub Action
   - Monitor deployment in Coolify dashboard

## Manual Deployment Commands

```bash
# Build the Docker image locally
docker build -t citychallenge:local .

# Test with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Deployment Flow

1. **Code Push** → Triggers GitHub Actions
2. **Build** → Multi-architecture Docker image
3. **Push** → Image pushed to ghcr.io
4. **Test** → Container health check
5. **Deploy** → Coolify webhook triggered
6. **Live** → New version deployed

## Troubleshooting

### Build Failures
- Check GitHub Actions logs
- Ensure all files are committed
- Verify Dockerfile syntax

### Deployment Issues
- Check Coolify logs
- Verify webhook URL is correct
- Ensure image is accessible from Coolify

### Application Errors
- Check container logs in Coolify
- Verify PocketBase migrations
- Check file permissions in volumes