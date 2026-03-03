# E-Commerce Microservices

A lightweight e-commerce application built with Node.js, Express, MongoDB, and Docker.

## Architecture

- **Auth Service** (Port 5001): Handles user registration and login using JWT.
- **Product Service** (Port 5002): Manages products and orders.
- **Frontend Service** (Port 3000): Serves the web UI (HTML/Bootstrap).
- **MongoDB** (Port 27017): Database for all services.

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

## Environment Variables

Configuration is handled in `.env` and `docker-compose.yml`.
Default ports:
- Frontend: 3000
- Auth: 5001
- Product: 5002
- MongoDB: 27017
