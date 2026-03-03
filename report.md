# Project Report

## Implementation Overview

This repository hosts a Docker Compose orchestrated e-commerce demo composed of three Node.js/Express services plus MongoDB. The services are loosely coupled: the frontend serves static HTML, the auth service manages user credentials with JWT/bcrypt, and the product service stores products and orders in MongoDB. Communication happens via RESTful HTTP calls, and each service is wired through Docker Compose so they resolve `mongodb` as the shared database host.

## Service Breakdown

### Auth Service (`auth-service/`)

- **Stack**: Express, Mongoose, dotenv, cors, body-parser, bcryptjs, jsonwebtoken.
- **Entry point**: `server.js`. Reads `PORT` (default 5001) and `MONGO_URL` (default `mongodb://mongodb:27017/ecommerce_ci_cd`) from environment variables or `.env`.
- **Data model**: `User` schema with `username` and hashed `password`.
- **Endpoints**:
  - `GET /`: health check.
  - `POST /register`: requires `username` + `password`; hashes the password with `bcrypt` and saves the user if the username is unique.
  - `POST /login`: validates user credentials and issues a JWT (`secretkey`, 1h expiry) along with user metadata.
  - `GET /users`: returns all users without passwords (primarily for debugging/admin purposes).
- **Notes**: JWT secret is hard-coded and can be overridden by injecting custom configuration before deployment; consider centralizing secrets for production.

### Product Service (`product-service/`)

- **Stack**: Express, Mongoose, dotenv, cors, body-parser.
- **Entry point**: `server.js`. Uses `PORT` 5002 by default and the same Mongo URL as the auth service.
- **Data models**:
  - `Product`: stores `name`, `price`, optional `description`, and `imageUrl`.
  - `Order`: stores `userId`, `productId`, `productName`, `quantity`, `totalPrice`, and timestamp.
- **Endpoints**:
  - `GET /`: health check.
  - `GET /products`: returns all products.
  - `POST /products`: creates a product from `name`, `price`, `description`, and `imageUrl`.
  - `GET /orders`: optionally filter by `userId` query parameter.
  - `POST /orders`: expects `userId`, `productId`, and optional `quantity`; validates the product exists, calculates `totalPrice`, saves the order, and returns a confirmation message.
- **Notes**: Errors return HTTP 500 with a JSON `error` message; verifies product existence before creating orders.

### Frontend Service (`frontend-service/`)

- **Stack**: Express static server.
- **Entry point**: `server.js`. Serves files from `public/` on port 3000 (configurable via `PORT`).
- **Content**: Plain HTML/Bootstrap pages that talk to the auth and product services via REST (forms for login/registration, product listing, and order submission).
- **Notes**: The frontend is purely static; no build toolchain is required beyond copying assets into `public/`.

## Data and Environment

- **MongoDB**: Hosted in the `mongodb` Docker container on port 27017, shared by auth and product services. The Compose network name is `ecommerce-network`, and the Mongo volume is `mongodb_data`.
- **Environment variables**:
  - `AUTH_PORT`, `PRODUCT_PORT`, `FRONTEND_PORT` are published and injected into each container via `docker-compose.yml`.
  - `MONGO_URL` defaults to `mongodb://mongodb:27017/ecommerce_ci_cd` and can be overridden for CI/CD or staging.
- **Configuration pattern**: Each service uses `dotenv` and reads from process environments, so overriding variables in `.env` or at container run time is straightforward.

## Build, Test, and Lint Commands

- `npm install` inside each service directory before running or rebuilding the container (`auth-service`, `product-service`, `frontend-service`). There are no package-level `scripts` defined, so the runtime is `node server.js`.
- `docker-compose up --build`: builds all images and starts the entire stack (MongoDB plus three services).
- `docker-compose up -d --build <service>`: rebuild and start a single service in detached mode (e.g., `docker-compose up -d --build auth-service`).
- No automated tests or linters exist; manual verification via the UI (see below) is the safety net.

## Manual Verification Steps

1. Start the stack (`docker-compose up --build`).
2. Visit `http://localhost:3000`.
3. Register a user via the register tab, then log in to retrieve the JWT/session.
4. Use the UI to add products; each creation hits the product service via `POST /products`.
5. “Buy Now” on a product to create an order, which calls `POST /orders` after verifying the product exists.
6. Confirm order history in the “My Orders” tab, which triggers `GET /orders` scoped to the logged-in user.

## Key Conventions

- **Port assignments**: Frontend 3000, Auth 5001, Product 5002, MongoDB 27017. The Compose environment ensures each service listens on its assigned port.
- **Internal naming**: Services refer to the Mongo container as `mongodb`, so any manual requests from within the Compose network use that hostname (e.g., `mongodb://mongodb:27017/...`).
- **REST contracts**: All endpoints expect/return JSON. Error responses use HTTP 4xx/5xx codes with descriptive `message`/`error` fields.
- **Docker-first development**: While the services can run individually via `node server.js`, every developer is encouraged to use Docker Compose to ensure the shared MongoDB and networking configuration match the production behaviour.

## Docker Commands

1. `docker-compose up --build`: Build and start every container (MongoDB + Auth + Product + Frontend).
2. `docker-compose down`: Stop and remove containers, networks, and default volume references.
3. `docker-compose up -d --build <service>`: Rebuild and restart one service in detached mode (replace `<service>` with `auth-service`, `product-service`, or `frontend-service`).
4. `docker-compose logs -f <service>`: Tail logs for a specific service (`docker-compose logs -f auth-service`).
5. `docker-compose exec <service> sh`: Get a shell inside a running container for debugging (use `sh` because the images are minimal).
6. `docker-compose ps`: List the status of all containers to verify they are healthy.
7. `docker-compose build --no-cache <service>`: Force a clean rebuild of a single service image when dependencies change.

Use `AUTH_PORT`, `PRODUCT_PORT`, `FRONTEND_PORT`, and `MONGO_URL` in `.env` to override defaults before running these commands if needed.
