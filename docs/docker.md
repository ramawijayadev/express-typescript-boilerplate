# Docker Support

 This project includes full Docker support for easy development and deployment testing.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Quick Start

1. **Start the application:**
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build the Application image (`node:22-alpine` based).
   - Start the PostgreSQL database (`postgres`).
   - Start the Redis service (`redis`).
   - Start Mailpit for email capture (`mailpit`).
   - Run database migrations automatically.
   - Start the API server.

2. **Access the services:**

   | Service | URL / POrt | Description |
   |---------|------------|-------------|
   | **API** | `http://localhost:3000` | Main Express Application |
   | **Swagger UI** | `http://localhost:3000/docs` | API Documentation |
   | **Mailpit** | `http://localhost:8025` | View sent emails (Web UI) |
   | **Postgres** | `localhost:5432` | Database access (User: `postgres`, Pass: `postgres`, DB: `express_boilerplate`) |
   | **Redis** | `localhost:6379` | Redis access |

## Configuration

Creating a local `.env` file is **not required** when running with Docker Compose. The setup uses `.env.docker` automatically to configure all services.

If you need to change configurations (e.g. ports), you can modify `.env.docker` or override them in `docker-compose.yml`.

## Stopping the Services

To stop the containers:

```bash
docker-compose down
```

To stop and remove volumes (reset database):

```bash
docker-compose down -v
```

## Troubleshooting

### Port Conflicts
If you see errors like `Bind for 0.0.0.0:3000 failed: port is already allocated`, it means something is already running on that port (likely your local dev server).
Stop your local server (e.g. `Ctrl+C` in your terminal) or modify the port mapping in `docker-compose.yml`.
