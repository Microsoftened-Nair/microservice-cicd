# Copilot Instructions

## High-Level Architecture

This project is a microservices-based e-commerce application orchestrated with Docker Compose.

- **Frontend Service** (`frontend-service/`): Serves the UI on port 3000.
- **Auth Service** (`auth-service/`): Handles user registration/login via JWT on port 5001.
- **Product Service** (`product-service/`): Manages products and orders on port 5002.
- **Database**: A shared MongoDB instance running on port 27017.

## Build and Run

The primary way to run the application is via Docker Compose:

```bash
docker-compose up --build
```

To rebuild a specific service:

```bash
docker-compose up -d --build <service-name>
# Example: docker-compose up -d --build auth-service
```

## Testing

There are currently no automated tests in the repository. Verification is done manually via the frontend at `http://localhost:3000`.

- **Register**: Create a new account.
- **Login**: Authenticate with credentials.
- **Products**: Add and view products.
- **Orders**: Place orders and view history.

## Key Conventions

- **Ports**:
  - Frontend: 3000
  - Auth: 5001
  - Product: 5002
  - MongoDB: 27017
- **Database Connection**: All services connect to the `mongodb` container using the internal hostname `mongodb` (e.g., `mongodb://mongodb:27017/ecommerce`).
- **Environment Variables**: Managed in the root `.env` file and passed to containers via `docker-compose.yml`.
- **Service Communication**: Services communicate via HTTP/REST.

## Development

- **Node.js**: All services are Node.js/Express applications.
- **No Build Scripts**: `package.json` files currently lack `scripts` sections; they rely on `server.js` being the entry point.
- **Docker First**: Development is assumed to happen within Docker or with a local environment mirroring the Docker setup.

## Recommended Tools

- **Docker MCP Server**: Recommended for managing containers and inspecting logs directly from the editor.
