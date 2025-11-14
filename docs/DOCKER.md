# Docker Deployment Guide

This guide explains how to run the Super Carer App using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of available RAM
- At least 5GB of available disk space

## Quick Start

### Production Deployment

1. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your production values:**

   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://careappapi.intellexio.com/api/v1
   NEXT_PUBLIC_SOCKET_URL=wss://careappapi.intellexio.com/ws
   ```

3. **Build and start services:**

   ```bash
   docker-compose up -d
   ```

4. **Check service status:**

   ```bash
   docker-compose ps
   docker-compose logs -f app
   ```

5. **Access the application:**
   - Direct: http://localhost:3000
   - Via Nginx: http://localhost

### Development Deployment

1. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Start development services:**

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the application:**
   - http://localhost:3000

## Environment Variables

### Required Variables

These variables must be set at **build time** for Next.js:

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket server URL

### Important Notes

- `NEXT_PUBLIC_*` variables are embedded into the build and cannot be changed at runtime
- To change these variables, you must rebuild the Docker image
- Use `.env` file or pass as build args

## Docker Commands

### Production

```bash
# Build and start all services
docker-compose up -d

# Build without cache
docker-compose build --no-cache

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a specific service
docker-compose restart app

# Execute command in running container
docker-compose exec app sh
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app-dev

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build
```

## Service Architecture

### Production (docker-compose.yml)

- **app**: Next.js application (port 3000)
- **redis**: Redis cache (port 6379)
- **nginx**: Reverse proxy (ports 80, 443)

### Development (docker-compose.dev.yml)

- **app-dev**: Next.js with hot reload (port 3000)
- **redis-dev**: Redis cache (port 6379)

## Troubleshooting

### Build Issues

**Problem**: Build fails with "NEXT*PUBLIC*\* not defined"

**Solution**: Ensure environment variables are set in `.env` file or passed as build args:

```bash
docker-compose build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### Runtime Issues

**Problem**: Application shows wrong API URL

**Solution**: Rebuild the image with correct environment variables:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Problem**: Hot reload not working in development

**Solution**: Ensure volumes are properly mounted:

```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

### Health Check Issues

**Problem**: Container keeps restarting

**Solution**: Check logs and health check status:

```bash
docker-compose logs app
docker inspect --format='{{json .State.Health}}' super-carer-app
```

### Permission Issues

**Problem**: Permission denied errors

**Solution**: The app runs as non-root user (nextjs:nodejs). Ensure proper permissions:

```bash
docker-compose exec app ls -la
```

## Performance Optimization

### Production

1. **Enable Redis caching** - Already configured
2. **Use Nginx for static assets** - Already configured
3. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: "1"
         memory: 1G
       reservations:
         cpus: "0.5"
         memory: 512M
   ```

### Development

1. **Use volume mounts** - Already configured for hot reload
2. **Disable telemetry** - Already set via NEXT_TELEMETRY_DISABLED
3. **Enable polling** - Set WATCHPACK_POLLING=true for file watching

## Security Best Practices

1. **Never commit `.env` files** - Already in .gitignore
2. **Use secrets for sensitive data** in production
3. **Run as non-root user** - Already configured
4. **Keep images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
5. **Use SSL/TLS** - Configure nginx with proper certificates

## Updating the Application

1. **Pull latest code:**

   ```bash
   git pull origin main
   ```

2. **Rebuild and restart:**

   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Verify deployment:**
   ```bash
   docker-compose ps
   docker-compose logs -f app
   ```

## Backup and Restore

### Backup Redis Data

```bash
docker-compose exec redis redis-cli BGSAVE
docker cp super-carer-redis:/data/dump.rdb ./backup/
```

### Restore Redis Data

```bash
docker-compose down
docker cp ./backup/dump.rdb super-carer-redis:/data/
docker-compose up -d
```

## Monitoring

### View Resource Usage

```bash
docker stats super-carer-app super-carer-redis
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

## Support

For issues related to:

- Docker configuration: Check this guide
- Application errors: Check application logs
- Build errors: Ensure all environment variables are set correctly
