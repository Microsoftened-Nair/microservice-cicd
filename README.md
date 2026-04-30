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

This repository now uses one workflow:

**Release Pipeline**: `.github/workflows/release.yml`
  - Runs on pushes to `main` and manual dispatch.
  - Checks Node syntax for each service and validates `docker-compose.yml`.
  - Builds each Docker image, scans it with Trivy, pushes it to GHCR, and signs it with Cosign.
  - Generates the frontend runtime config from GitHub Actions variables before building the frontend image.
  - Triggers Render deploys for `auth-service`, `product-service`, and `frontend-service` in that order after the images are published.

### Required GitHub Repository Settings

1. In **Settings > Actions > General**:
  - Ensure workflows are allowed to run.

2. In **Settings > Variables and secrets > Actions > Variables**:
  - Add `AUTH_API_URL` (for example, your deployed auth service URL)
  - Add `PRODUCT_API_URL` (for example, your deployed product service URL)
  - Add `RENDER_AUTH_SERVICE_ID`
  - Add `RENDER_PRODUCT_SERVICE_ID`
  - Add `RENDER_FRONTEND_SERVICE_ID`

3. In **Settings > Variables and secrets > Actions > Secrets**:
  - Add `RENDER_API_KEY` (Render API token)
  - Add `COSIGN_PRIVATE_KEY` (private signing key contents)
  - Add `COSIGN_PASSWORD` (password used for the private key)

Notes:

- GHCR publishing uses the built-in `GITHUB_TOKEN`; no extra token secret is required for publishing.
- Render services should be configured as image-backed services that pull from the GHCR image names pushed by the workflow.
- If your GHCR packages are private, make sure Render has registry access configured for GHCR.

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

If the UI appears unstyled (for example, plain bullets, default inputs, and no dark navbar), your network may be blocking the Bootstrap CDN (`cdn.jsdelivr.net`).

The frontend now includes a local fallback stylesheet in `frontend-service/public/css/style.css` that keeps the pages usable even when CDN assets are unavailable. If styling still looks plain, open browser DevTools and verify these requests return `200`:

- `/css/style.css`
- `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`
