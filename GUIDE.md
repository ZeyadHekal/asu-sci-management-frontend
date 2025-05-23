# ASU Science Management Frontend - Docker Setup Guide

This guide provides comprehensive instructions for running the ASU Science Management Frontend application using Docker.

## Prerequisites

Before starting, ensure you have the following installed on your system:

- **Docker**: Version 20.10 or higher
  - [Install Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Install Docker Desktop for macOS](https://docs.docker.com/desktop/install/mac-install/)
  - [Install Docker Engine for Linux](https://docs.docker.com/engine/install/)
- **Docker Compose**: Usually included with Docker Desktop
- **Git**: For cloning the repository

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd asu-sci-management-frontend
```

### 2. Environment Setup

Create a `.env` file in the root directory (optional, as defaults are provided):

```bash
# Optional environment variables
PORT=8080
COMPOSE_PROJECT_NAME=asu-sci-frontend
```

### 3. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

The application will be available at:
- **Local**: http://localhost:8080
- **Network**: http://0.0.0.0:8080

### 4. Stop the Application

```bash
# Stop the application
docker-compose down

# Stop and remove volumes (if any)
docker-compose down -v
```

## Alternative Docker Commands

### Using Docker Only (without Docker Compose)

If you prefer to use Docker commands directly:

```bash
# Build the image
docker build -t asu-sci-frontend .

# Run the container
docker run -p 8080:80 --name asu-sci-app asu-sci-frontend

# Stop and remove the container
docker stop asu-sci-app
docker rm asu-sci-app
```

## Architecture Overview

The Docker setup uses a **multi-stage build** approach for optimal production deployment:

### Build Stage
- Uses `node:20-alpine` as the base image
- Installs `pnpm` package manager
- Installs dependencies using `pnpm install --frozen-lockfile`
- Builds the React application using `pnpm run build`

### Production Stage
- Uses `nginx:alpine` for serving the built application
- Copies built files to nginx document root
- Applies custom nginx configuration for SPA routing
- Includes security headers and gzip compression

## Configuration Files

### Docker Configuration

- **`Dockerfile`**: Multi-stage build configuration
- **`docker-compose.yml`**: Service orchestration
- **`nginx.conf`**: Nginx web server configuration
- **`docker-entrypoint.sh`**: Container startup script

### Key Features

1. **Single Page Application (SPA) Support**: Configured with `try_files` directive for client-side routing
2. **Security Headers**: Includes X-Content-Type-Options, X-XSS-Protection, X-Frame-Options
3. **Gzip Compression**: Enabled for static assets to reduce load times
4. **Environment Variable Support**: Configurable port and project name

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | External port to access the application |
| `COMPOSE_PROJECT_NAME` | `app` | Docker Compose project name |

## Development vs Production

This Docker setup is optimized for **production deployment**. For development, consider using:

```bash
# Development with hot reload
pnpm install
pnpm run dev
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change the port in docker-compose.yml or .env file
   PORT=8081 docker-compose up
   ```

2. **Permission Denied (Linux/macOS)**
   ```bash
   # Ensure docker-entrypoint.sh is executable
   chmod +x docker-entrypoint.sh
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs app
   
   # Or for standalone container
   docker logs asu-sci-app
   ```

4. **Build Failures**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune -f
   docker-compose build --no-cache
   ```

### Logs and Debugging

```bash
# View real-time logs
docker-compose logs -f app

# View specific service logs
docker-compose logs app

# Execute commands inside the running container
docker-compose exec app sh
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Set appropriate environment variables for your production environment
2. **Reverse Proxy**: Use a reverse proxy like Traefik or nginx for SSL termination
3. **Health Checks**: Implement health check endpoints
4. **Monitoring**: Add monitoring and logging solutions
5. **Security**: Review and update security headers as needed

## Technology Stack

This application is built with:

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS with Vristo components
- **State Management**: Zustand
- **HTTP Client**: Axios with Tanstack React Query
- **API Generation**: Kubb for OpenAPI/Swagger
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router 7

## Support

For issues related to Docker setup, please check:
1. Docker and Docker Compose versions
2. Available system resources (memory, disk space)
3. Network connectivity
4. Container logs for specific error messages

---

**Note**: This guide assumes you have basic familiarity with Docker and command-line operations. For Docker basics, refer to the [official Docker documentation](https://docs.docker.com/). 