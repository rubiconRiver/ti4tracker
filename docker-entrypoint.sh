#!/bin/sh
set -e

echo "Starting TI4 Tracker..."

# Function to check if database is ready
wait_for_db() {
  echo "Waiting for database to be ready..."

  # Extract host and port from DATABASE_URL
  # Format: postgresql://user:pass@host:port/db
  DB_HOST=$(echo "$DATABASE_URL" | sed -e 's/.*@//' -e 's/:.*//')
  DB_PORT=$(echo "$DATABASE_URL" | sed -e 's/.*@[^:]*://' -e 's/\/.*//')

  # Default port if not specified
  if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DB_HOST" ]; then
    DB_PORT=5432
  fi

  max_attempts=30
  attempt=1

  while [ $attempt -le $max_attempts ]; do
    if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
      echo "Database is ready!"
      return 0
    fi
    echo "Attempt $attempt/$max_attempts: Database not ready, waiting..."
    sleep 2
    attempt=$((attempt + 1))
  done

  echo "Error: Database did not become ready in time"
  exit 1
}

# Only wait for DB and run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  wait_for_db

  echo "Running database migrations..."
  npx prisma migrate deploy

  echo "Migrations completed successfully!"
else
  echo "Warning: DATABASE_URL not set, skipping migrations"
fi

echo "Starting application..."

# Execute the main command (passed as CMD)
exec "$@"
