# Project Allocator v3 - Backend

## Tech Stack

- FastAPI
- Poetry for package manager and tooling
- SQLModel for ORM
- Polyfactory for database seeding
- Alembic for database migration
- Typer for database utility CLI

## Code Structure

- `migrations/`
  - Contains code for DB migrations
  - Uses alembic and SQLModel
- `src/`
  - `resources/`
    - Contains resources like an HTML template for email notification
  - `routers/`
    - Contains API endpoint implementations
  - `models/`
    - Contains code for database models and schemas
  - `factories/`
    - Contains code for unit tests and database seeding
    - Uses `factory-boy`
  - `algorithms.py`
    - Edit this file to customise your project allocation algorithm
  - `auth.py`
    - Loads configuration from environment variables
    - Sets up the Microsoft SSO authentication
  - `cli.py`
    - Edit this file to add custom CLI commands e.g. `poetry run db seed`
    - Uses `typer`: https://typer.tiangolo.com/
  - `db.py`
    - Loads configuration from environment variables
    - Sets up the database connection
  - `dependencies.py`
    - Edit this file to add custom FastAPI dependencies e.g. block admin access
    - See this tutorial for more detail: https://fastapi.tiangolo.com/tutorial/dependencies/
  - `main.py`
    - Main entry point for the backend
    - Sets up the FastAPI server and OpenAPI documentation
- `Dockerfile`
  - Dockerfile for local development
- `Dockerfile.production`
  - Dockerfile for production on Azure
  - Takes security constraints of Appvia Wayfinder into account
- `.env`
  - Sets up environment variables for local development
  - Environment variables for production development are provided via Appvia Wayfinder

## Development Guide

### Hot Reload

The backend server restarts automatically when it detects any changes under the root directory.

But this may fail if you edit some of the configuration files e.g. alembic.ini. In case of such failure, try running:

```bash
docker compose restart --build backend
```

### Entering Container

```bash
docker compose up -d
docker compose exec -it backend /bin/bash
```

### Seeding Database

Enter the `backend` container. You can seed the database by running the following command:

```bash
poetry run db seed
```

This command automatically resets the database tables, so there is no need to run `poetry run db reset` beforehand.

### Auto-generating migrations

Enter the `backend` container and check the database connection as follows:

```bash
poetry run alembic current
```

Now you can run the following command to auto-generate migrations:

```bash
poetry run alembic revision --autogenerate -m "initial migration"
```

### Creating new migrations

You can create a new revision and upgrade the database by:

```bash
poetry run alembic revision -m "update user table"
poetry run alembic upgrade head
poetry run alembic history
```

To downgrade the database, simply run:

```bash
poetry run downgrade -1
poetry run downgrade base
```
