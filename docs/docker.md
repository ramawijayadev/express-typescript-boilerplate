# Docker Guide

This guide explains how to build and run the Express TypeScript boilerplate using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Building the Docker Image](#building-the-docker-image)
- [Running the Container](#running-the-container)
- [Using Docker Compose](#using-docker-compose)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Dockerfile Architecture](#dockerfile-architecture)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher (for full stack setup)
- At least 2GB of available disk space

## Quick Start

The fastest way to get the entire stack running:

```bash
# 1. Copy environment file
cp .env.example .env.docker

# 2. Update .env.docker with your configuration
# (At minimum, ensure DATABASE_URL points to the docker postgres service)

# 3. Start all services
docker-compose up -d

# 4. Check health
curl http://localhost:3000/api/v1/health

# 5. View logs
docker-compose logs -f app

# 6. Stop all services
docker-compose down
```

## Building the Docker Image

### Basic Build

```bash
docker build -t express-ts-boilerplate .
```

### Build with Custom Tag

```bash
docker build -t express-ts-boilerplate:v1.0.0 .
```

### Build Without Cache (Clean Build)

```bash
docker build --no-cache -t express-ts-boilerplate .
```

### Build for Different Platforms

```bash
# For ARM64 (Apple Silicon, AWS Graviton)
docker build --platform linux/arm64 -t express-ts-boilerplate:arm64 .

# For AMD64 (Intel/AMD)
docker build --platform linux/amd64 -t express-ts-boilerplate:amd64 .
```

## Running the Container

### Standalone Container (Development)

**Note**: For standalone usage, you'll need external PostgreSQL and Redis instances.

```bash
docker run -d \
  --name express-app \
  --env-file .env \
  -p 3000:3000 \
  express-ts-boilerplate
```

### With Custom Port

```bash
docker run -d \
  --name express-app \
  --env-file .env \
  -e APP_PORT=8080 \
  -p 8080:8080 \
  express-ts-boilerplate
```

### With Environment Variables

```bash
docker run -d \
  --name express-app \
  -e NODE_ENV=production \
  -e APP_PORT=3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_HOST=redis \
  -e JWT_SECRET=your-secret-key \
  -p 3000:3000 \
  express-ts-boilerplate
```

### Interactive Mode (for debugging)

```bash
docker run -it \
  --rm \
  --env-file .env \
  -p 3000:3000 \
  express-ts-boilerplate \
  sh
```

## Using Docker Compose

Docker Compose provides the full development stack including PostgreSQL, Redis, and Mailpit.

### Start All Services

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop All Services

```bash
# Stop but keep data
docker-compose down

# Stop and remove volumes (CAUTION: destroys data)
docker-compose down -v
```

### Rebuild and Restart

```bash
docker-compose up -d --build
```

### Run Database Migrations

```bash
# Migrations run automatically on container start
# To run manually:
docker-compose exec app npx prisma migrate deploy
```

### Access Prisma Studio

```bash
docker-compose exec app npx prisma studio
```

### Access Services

- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/health
- **Mailpit UI**: http://localhost:8025
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Environment Variables

### Required Variables

```env
NODE_ENV=production
APP_PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secure-secret-minimum-32-characters
CORS_ORIGIN=https://your-frontend.com
```

### Docker Compose Specifics

When using Docker Compose, update `.env.docker`:

```env
# Use docker service names as hostnames
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/express_boilerplate
REDIS_HOST=redis
SMTP_HOST=mailpit
SMTP_PORT=1025
```

### All Available Variables

See [.env.example](../.env.example) for the complete list of configuration options.

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random `JWT_SECRET` (64+ characters)
- [ ] Configure proper `CORS_ORIGIN` (never use `*`)
- [ ] Use secure database credentials
- [ ] Enable HTTPS/TLS
- [ ] Set appropriate rate limits
- [ ] Review and configure logging levels
- [ ] Set `ENABLE_BACKGROUND_JOBS` appropriately

### Production Build Example

```bash
# Build for production
docker build \
  --build-arg NODE_ENV=production \
  -t express-ts-boilerplate:production \
  .

# Run with production configuration
docker run -d \
  --name express-app-prod \
  --env-file .env.production \
  --restart unless-stopped \
  -p 3000:3000 \
  express-ts-boilerplate:production
```

### Health Checks

The Docker image includes a built-in health check that polls `/api/v1/health` every 30 seconds. Container orchestrators like Kubernetes, ECS, and Docker Swarm will use this to determine container health.

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' express-app
```

### Resource Limits

Set resource limits in production:

```bash
docker run -d \
  --name express-app \
  --memory="512m" \
  --cpus="1.0" \
  --env-file .env.production \
  -p 3000:3000 \
  express-ts-boilerplate
```

In docker-compose.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Dockerfile Architecture

The Dockerfile uses a **multi-stage build** for optimal image size and security:

### Stage 1: Base
- Sets up Node.js 22 Alpine
- Enables pnpm package manager
- Installs dumb-init for signal handling

### Stage 2: Dependencies
- Installs all npm dependencies
- Cached separately for faster rebuilds

### Stage 3: Builder
- Generates Prisma client
- Compiles TypeScript to JavaScript
- Prunes devDependencies

### Stage 4: Runner (Final Image)
- Production-only dependencies
- Compiled application code
- Prisma schema and generated client
- Runs as non-root user (`nodejs:nodejs`)
- Includes health check
- Minimal attack surface

### Key Features

✅ **Security**: Runs as non-root user  
✅ **Size**: Alpine-based, ~200-400MB final image  
✅ **Health**: Built-in health check for orchestration  
✅ **Caching**: Optimized layer caching for fast rebuilds  
✅ **Signals**: Proper signal handling with dumb-init  
✅ **Production-Ready**: Only production dependencies in final image  

## Troubleshooting

### Container Exits Immediately

**Check logs:**
```bash
docker logs express-app
```

**Common causes:**
- Missing required environment variables
- Database connection failure
- Invalid configuration

### Database Connection Errors

**When using Docker Compose:**
- Ensure DATABASE_URL uses service name: `postgres` not `localhost`
- Wait for PostgreSQL to be ready (health check configured in docker-compose.yml)

**Standalone container:**
- Use host machine's IP for DATABASE_URL (not `localhost`)
- On macOS/Windows: use `host.docker.internal` as hostname
  ```
  DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
  ```

### Prisma Client Not Found

This was a bug in earlier Dockerfile versions. The current Dockerfile includes:

```dockerfile
COPY --from=builder /app/src/generated ./src/generated
```

If you still see this error, rebuild without cache:
```bash
docker build --no-cache -t express-ts-boilerplate .
```

### Port Already in Use

Change the host port mapping:
```bash
docker run -d -p 8080:3000 express-ts-boilerplate
```

Or set a different APP_PORT:
```bash
docker run -d -e APP_PORT=8080 -p 8080:8080 express-ts-boilerplate
```

### Out of Memory

Increase Docker's memory limit or set constraints:
```bash
docker run --memory="1g" express-ts-boilerplate
```

### Slow Build Times

**Use layer caching effectively:**
- Package files are copied before source code
- Only rebuild when dependencies change

**Exclude unnecessary files:**
- The `.dockerignore` file prevents copying `node_modules`, tests, etc.

**Clean up build cache:**
```bash
docker builder prune
```

### Health Check Failing

**Check the health status:**
```bash
docker inspect express-app | grep -A 10 Health
```

**Common issues:**
- App not listening on correct port
- APP_BASE_PATH configured incorrectly
- Database not connected (app might not start)

**Test manually:**
```bash
docker exec express-app wget -qO- http://localhost:3000/api/v1/health
```

### Permission Denied Errors

The container runs as user `nodejs` (UID 1001). If mounting volumes:

```bash
# Ensure proper permissions on host
chown -R 1001:1001 ./logs
```

### Redis Connection Issues

**In Docker Compose**: Use service name `redis`  
**Standalone**: Ensure Redis is accessible and REDIS_HOST is correct

```bash
# Test Redis connectivity from container
docker exec express-app sh -c 'nc -zv $REDIS_HOST $REDIS_PORT'
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Deployment Guide](./deployment.md) (if available)
- [.env.example](../.env.example) - All configuration options

## Support

For issues specific to the boilerplate, please check the main [README](../README.md) or open an issue in the repository.
