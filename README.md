# E-Commerce Microservices

A lightweight e-commerce application built with Node.js, Express, MongoDB, and Docker.

## Architecture

- **Auth Service** (Port 5001): Handles user registration and login using JWT.
- **Product Service** (Port 5002): Manages products and orders.
- **Frontend Service** (Port 3000): Serves the web UI (HTML/Bootstrap).
- **MongoDB** (internal container network): Database for all services.

## Prerequisites

- Docker and Docker Compose installed.

## Setup & Run

1.  Clone the repository (or unzip the project).
2.  Navigate to the project root:
    ```bash
    cd ecommerce-microservices
    ```
3.  Start the services:
    ```bash
    docker-compose up --build
    ```
4.  Open your browser to [http://localhost:3000](http://localhost:3000).

## Usage

1.  **Register**: Go to the login page and switch to the "Register" tab. Create a new account.
2.  **Login**: Use your new credentials to log in.
3.  **Products**: Browse the product list. Use the "Add Product" form to create new items (for demo purposes).
4.  **Orders**: Click "Buy Now" on a product to create an order. View your history in the "My Orders" tab.

## Development

- **Auth Service**: `auth-service/`
- **Product Service**: `product-service/`
- **Frontend Service**: `frontend-service/`

## CI/CD (GitHub Actions)

This repository includes two workflows:

- **CI**: `.github/workflows/ci.yml`
  - Runs on push and pull requests.
  - Checks Node syntax for each service (`node --check server.js`).
  - Validates `docker-compose.yml`.
  - Builds Docker images for all services.

- **CD**: `.github/workflows/cd.yml`
  - Runs on pushes to `main` (and manual dispatch).
  - Publishes Docker images to GitHub Container Registry (GHCR).
  - Deploys static frontend files from `frontend-service/public` to GitHub Pages.

### Required GitHub Repository Settings

1. In **Settings > Actions > General**:
  - Ensure workflows are allowed to run.

2. In **Settings > Pages**:
  - Set source to **GitHub Actions**.

3. In **Settings > Variables and secrets > Actions > Variables**:
  - Add `AUTH_API_URL` (example: `https://your-auth-api.example.com`)
  - Add `PRODUCT_API_URL` (example: `https://your-product-api.example.com`)

Notes:

- GHCR publishing uses the built-in `GITHUB_TOKEN`; no extra secret is required for that.
- GitHub Pages can host only the frontend static files. Deploy backend services separately (for example Render, Railway, Fly.io, or a VPS with Docker).

## Environment Variables

Configuration is handled in `.env` and `docker-compose.yml`.
Default ports:
- Frontend: 3000
- Auth: 5001
- Product: 5002

## Troubleshooting

If you see an error like `failed to bind host port ... 27017 ... address already in use`, it means another local process (commonly a local MongoDB install) is already using port `27017`.

This project does not publish MongoDB to a host port by default, so it can run even when local MongoDB is already running.

If you explicitly need host access to the containerized MongoDB (for example, from MongoDB Compass), temporarily add this under the `mongodb` service in `docker-compose.yml`:

```yaml
ports:
  - "27017:27017"
```
