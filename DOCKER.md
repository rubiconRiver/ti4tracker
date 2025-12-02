# Docker Setup for TI4 Tracker

This guide explains how to run TI4 Tracker using Docker, either locally or in the cloud.

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Quick Start (Local Development with Docker)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ti4tracker
   ```

2. **Start everything with Docker Compose:**
   ```bash
   docker compose up -d
   ```

   This will:
   - Start a PostgreSQL database
   - Build the Next.js application
   - Run database migrations automatically
   - Start the app on http://localhost:3000

3. **View logs:**
   ```bash
   docker compose logs -f
   ```

4. **Stop the containers:**
   ```bash
   docker compose down
   ```

## Development Setup (Without Docker for the App)

For faster development iteration, you can run just the database in Docker:

1. **Start only the database:**
   ```bash
   docker compose up -d postgres
   ```

2. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Docker Compose (VPS/Cloud VM)

1. **Clone and configure:**
   ```bash
   git clone <repository-url>
   cd ti4tracker
   ```

2. **Create a `.env` file with production values:**
   ```bash
   # Use strong passwords in production!
   echo 'DATABASE_URL="postgresql://ti4tracker:STRONG_PASSWORD@postgres:5432/ti4tracker"' > .env
   ```

3. **Update docker-compose.yml** with your production password:
   ```yaml
   environment:
     POSTGRES_PASSWORD: STRONG_PASSWORD
   ```

4. **Build and run:**
   ```bash
   docker compose up -d --build
   ```

### Option 2: External Database (Recommended for Production)

For cloud deployments, use a managed PostgreSQL service (e.g., Neon, Supabase, AWS RDS, etc.):

1. **Build just the app image:**
   ```bash
   docker build -t ti4tracker .
   ```

2. **Run with external database:**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://user:pass@your-db-host:5432/ti4tracker" \
     -e NODE_ENV=production \
     ti4tracker
   ```

### Option 3: Cloud Container Services

The Docker image can be deployed to:
- **Railway** - Auto-detects Dockerfile
- **Render** - Add as a Docker service
- **Fly.io** - Use `fly launch`
- **Google Cloud Run** - Push to GCR and deploy
- **AWS ECS/Fargate** - Push to ECR and create service

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

## Architecture Notes

- **Custom Server**: Uses a custom Node.js server (not Next.js standalone) to support Socket.io for real-time updates
- **Migrations**: Run automatically at container startup via `docker-entrypoint.sh`
- **Health Check**: PostgreSQL has a health check; app waits for DB before starting

## Troubleshooting

### Database connection errors
- Ensure `DATABASE_URL` is correctly formatted
- Check that the database container/service is running
- Verify network connectivity between app and database

### Build failures
- Clear Docker cache: `docker compose build --no-cache`
- Ensure all files are present (especially `prisma/` directory)

### Socket.io not working
- Ensure your reverse proxy (if any) supports WebSocket connections
- For nginx, add WebSocket upgrade headers

## Useful Commands

```bash
# Rebuild and restart
docker compose up -d --build

# View app logs
docker compose logs -f app

# Access database
docker compose exec postgres psql -U ti4tracker -d ti4tracker

# Run Prisma Studio (local dev)
npm run db:studio
```
