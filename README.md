# Super Carer App - Docker Setup

A Next.js application for healthcare provider management with Docker containerization support.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Environment Setup

1. Copy the environment example file:

```bash
cp .env.example .env
```

2. Update the environment variables in `.env` as needed:

```bash
NEXT_PUBLIC_API_BASE_URL=https://careappapi.intellexio.com/api/v1
NEXT_PUBLIC_SOCKET_URL=ws://localhost:5221/ws
```

## 🐳 Docker Deployment

> 📖 For detailed Docker documentation, troubleshooting, and advanced configurations, see [DOCKER.md](./DOCKER.md)

### Production Deployment

Build and run the production version:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Environment

For development with hot reload:

```bash
# Build and start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

### Individual Service Management

```bash
# Build only the app
docker-compose build app

# Start only specific services
docker-compose up app redis

# Restart a service
docker-compose restart app

# View service logs
docker-compose logs app
```

## 📋 Services Overview

### Application (app)

- **Port**: 3000
- **Description**: Next.js application server
- **Health Check**: Available at `http://localhost:3000`

### Redis (redis)

- **Port**: 6379
- **Description**: Caching and session storage
- **Data**: Persisted in Docker volume `redis_data`

### Nginx (nginx) - Optional

- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Description**: Reverse proxy with rate limiting and caching
- **Features**:
  - Gzip compression
  - Security headers
  - WebSocket support
  - Static file caching

## 🛠️ Development Workflow

### Local Development with Docker

1. Start development environment:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. The application will be available at `http://localhost:3000`

3. Code changes will automatically reload thanks to volume mounting

4. Access Redis CLI for debugging:

```bash
docker-compose exec redis-dev redis-cli
```

### Building for Production

1. Build the production image:

```bash
docker-compose build app
```

2. Test production build locally:

```bash
docker-compose up app redis
```

## 🔧 Configuration

### Environment Variables

| Variable                   | Description          | Default                                    |
| -------------------------- | -------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL      | `https://careappapi.intellexio.com/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL`   | WebSocket server URL | `ws://localhost:5221/ws`                   |
| `NODE_ENV`                 | Node environment     | `production`                               |

### Docker Compose Overrides

Create a `docker-compose.override.yml` file for local customizations:

```yaml
version: "3.8"
services:
  app:
    environment:
      - CUSTOM_VAR=value
    ports:
      - "3001:3000" # Use different port
```

## 📊 Monitoring and Logs

### Health Checks

All services include health checks:

- **App**: HTTP check on port 3000
- **Redis**: Redis ping command

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Container Stats

```bash
# View resource usage
docker stats

# View running containers
docker-compose ps
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**:

```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Use different port in docker-compose.override.yml
```

2. **Build failures**:

```bash
# Clean build
docker-compose build --no-cache app

# Remove all containers and rebuild
docker-compose down -v
docker-compose up --build
```

3. **Permission issues**:

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

4. **Out of disk space**:

```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

### Debug Mode

Run containers in debug mode:

```bash
# Run with verbose logging
docker-compose up --verbose

# Access container shell
docker-compose exec app sh
```

## 🔒 Security Considerations

### Production Security

1. **Environment Variables**: Never commit `.env` to version control
2. **SSL/TLS**: Configure proper SSL certificates for production
3. **Firewall**: Restrict access to necessary ports only
4. **Updates**: Regularly update base images and dependencies

### Nginx Security Features

- Rate limiting on API endpoints
- Security headers (XSS, CSRF protection)
- Content Security Policy
- Request size limits

## 📦 Deployment

### Production Deployment

1. **Server Setup**:

```bash
# Clone repository
git clone <repository-url>
cd <project-directory>

# Set up environment
cp .env.example .env
# Edit .env with production values
```

2. **Deploy**:

```bash
# Pull latest images and deploy
docker-compose pull
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs app
```

3. **SSL Setup** (if using Nginx):

```bash
# Create SSL directory
mkdir -p ssl

# Add your SSL certificates
# ssl/cert.pem
# ssl/key.pem
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test with Docker: `docker-compose -f docker-compose.dev.yml up`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
