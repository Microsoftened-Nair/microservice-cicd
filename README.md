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

This repository includes four workflows:

- **CI**: `.github/workflows/ci.yml`
  - Runs on push and pull requests.
  - Checks Node syntax for each service (`node --check server.js`).
  - Validates `docker-compose.yml`.
  - Builds Docker images for all services.

- **Secure Image Release**: `.github/workflows/build-sign.yml`
  - Runs on pushes to `main` (and manual dispatch).
  - Builds each service image locally.
  - Runs Trivy scan (`HIGH,CRITICAL`) before publishing.
  - Pushes images to GHCR only after scan passes.
  - Signs pushed images with Cosign.
  - Optionally verifies signatures when `COSIGN_PUBLIC_KEY` is configured.

- **CD**: `.github/workflows/cd.yml`
  - Runs on pushes to `main` (and manual dispatch).
  - Deploys static frontend files from `frontend-service/public` to GitHub Pages.

### Render deployment (optional)

This repository includes an optional workflow that can trigger deploys of backend (and frontend) services on Render using the Render API: `.github/workflows/deploy-render.yml`.

Setup steps:

1. Create Web Services on Render for the `auth-service` and `product-service` (and optionally the `frontend-service`). You can connect the repo directly in Render or create services that deploy from a branch or an image.

2. In your GitHub repository settings add the following **Actions secrets**:
  - `RENDER_API_KEY` — a Render API key with permission to trigger deploys.

3. Add the Render service IDs as repository **Actions variables** (or secrets):
  - `RENDER_AUTH_SERVICE_ID`
  - `RENDER_PRODUCT_SERVICE_ID`
  - `RENDER_FRONTEND_SERVICE_ID` (optional)

4. Trigger the workflow manually from Actions or push to `main`. The workflow will POST to Render's deploy endpoint for each service ID you configure.

Manual API example (local test):

```bash
curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' 
```

Notes:
- The workflow requires `RENDER_API_KEY` to be set or it will fail early.
- Render's free plan supports web services and static sites; review Render quotas/limits before enabling automated deploys.

- **Trivy PR Scan**: `.github/workflows/trivy.yml`
  - Runs on pull requests to `main` (and manual dispatch).
  - Builds service images and scans them for `HIGH,CRITICAL` vulnerabilities.

### Required GitHub Repository Settings

1. In **Settings > Actions > General**:
  - Ensure workflows are allowed to run.

2. In **Settings > Pages**:
  - Set source to **GitHub Actions**.

3. In **Settings > Variables and secrets > Actions > Variables**:
  - Add `AUTH_API_URL` (example: `https://your-auth-api.example.com`)
  - Add `PRODUCT_API_URL` (example: `https://your-product-api.example.com`)

4. In **Settings > Variables and secrets > Actions > Secrets**:
  - Add `COSIGN_PRIVATE_KEY` (private signing key contents)
  - Add `COSIGN_PASSWORD` (password used for the private key)
  - Optional: `COSIGN_PUBLIC_KEY` (enables in-pipeline signature verification)

Notes:

- GHCR publishing uses the built-in `GITHUB_TOKEN`; no extra token secret is required for publishing.
- Image publishing is now centralized in `.github/workflows/build-sign.yml` so images are scanned and signed in one release path.
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

If the UI appears unstyled (for example, plain bullets, default inputs, and no dark navbar), your network may be blocking the Bootstrap CDN (`cdn.jsdelivr.net`).

The frontend now includes a local fallback stylesheet in `frontend-service/public/css/style.css` that keeps the pages usable even when CDN assets are unavailable. If styling still looks plain, open browser DevTools and verify these requests return `200`:

- `/css/style.css`
- `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`
