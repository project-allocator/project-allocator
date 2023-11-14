# Project Allocator v3

Welcome to Project Allocator v3!

This is the repository that contains:

- Frontend code for the project allocator.
- GitHub workflow to build and push the Docker image to GHCR.
  - Which will be consumed by the `project-allocator-deploy` repository.

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
  - `algorithms.py`
    - Edit this file to customise your project allocation algorithm
  - `auth.py`
    - Loads configuration from environment variables
    - Sets up the Microsoft SSO authentication
  - `cli.py`
    - Edit this file to add custom CLI commands e.g. `poetry run db seed`
    - Uses Typer: https://typer.tiangolo.com/
  - `config.py`
    - Loads configuration from `config.yaml`
  - `db.py`
    - Loads configuration from environment variables
    - Sets up the database connection
  - `dependencies.py`
    - Edit this file to add custom FastAPI dependencies e.g. block admin access
    - See this tutorial for more detail: https://fastapi.tiangolo.com/tutorial/dependencies/
  - `factories.py`
    - Edit this file when you add your own SQLModel models
    - Uses Polyfactory: https://polyfactory.litestar.dev/latest/
  - `main.py`
    - Main entry point for the backend
    - Sets up the FastAPI server and OpenAPI documentation
  - `models.py`
    - Edit this file to add your own SQLModel models e.g. model for project supervisor
    - Currently SQLModel has issues with circular import, and the easiest solution is to put all models in a single file: https://sqlmodel.tiangolo.com/tutorial/code-structure/
- `Dockerfile`
  - Dockerfile for local development
- `Dockerfile.production`
  - Dockerfile for production on Azure
  - Takes security constraints of Appvia Wayfinder into account
- `.env`
  - Sets up environment variables for local development
  - Environment variables for production development are provided via Appvia Wayfinder
- `config.yaml`
  - Configuration for the Project Allocator
  - See the deployment repository for more details

## Development Guide

### Hot Reload

The backend server restarts automatically when it detects any changes under the root directory.

But this may fail if you edit some of the configuration files e.g. alembic.ini. In case of such failure, try running:

```bash
~$ docker compose restart --build backend
```

### Entering the container

```bash
~$ docker compose up -d
~$ docker compose exec -it backend /bin/bash
```

### Seeding the database

Enter the `backend` container.

First create tables in the database by running:

```bash
~$ poetry run db create
```

This creates tables based on the models you defined in `models.py`.

You can now seed the database using the following command:

```bash
~$ poetry run db seed
```

### Auto-generating migrations

Enter the `backend` container.

First you need to check the database connection:

```bash
~$ poetry run alembic current
```

If you want to generate the initial migration, make sure the database is empty, otherwise Alembic skips the generation:

```bash
~$ poetry run db drop
```

Now run the following command to auto-generate migrations:

```bash
~$ poetry run alembic revision --autogenerate -m "Initial migration"
```

### Creating new migrations

You can create a new revision and upgrade the database by:

```bash
~$ poetry run alembic revision -m "Your Revision Message"
~$ poetry run alembic upgrade head
~$ poetry run alembic history
```

To downgrade the database, simply run:

```bash
~$ poetry run downgrade -1
~$ poetry run downgrade base
```

## Database Normalisation

You might find the following notes useful to check that the tables are in the normal form (BCNF).

$\text{user}$ table (BCNF)

- Keys:
  - $\text{id}$
  - $\text{email}$
- Foreign keys:
  - $\text{allocated\_id} \xrightarrow{fk} \text{project.id}$
- Functional dependencies:
  - $\text{email} \xrightarrow{fd} \text{id}$
  - $\text{id} \xrightarrow{fd} \text{email}$
  - $\text{id} \xrightarrow{fd} \text{name}$
  - $\text{id} \xrightarrow{fd} \text{role}$
  - $\text{id} \xrightarrow{fd} \text{accepted}$
  - $\text{id} \xrightarrow{fd} \text{allocated\_id}$

$\text{project}$ table (BCNF)

- Keys:
  - $\text{id}$
- Foreign keys:
  - $\text{proposer\_id} \xrightarrow{fk} \text{user.id}$
- Functional dependencies:
  - $\text{id} \xrightarrow{fd} \text{title}$
  - $\text{id} \xrightarrow{fd} \text{description}$
  - $\text{id} \xrightarrow{fd} \text{categories}$
  - $\text{id} \xrightarrow{fd} \text{approved}$
  - $\text{id} \xrightarrow{fd} \text{proposer\_id}$

$\text{shortlist}$ table (BCNF)

- Keys:
  - $(\text{user\_id}, \text{project\_id})$
- Functional dependencies:
  - $(\text{user\_id}, \text{project\_id}) \xrightarrow{fd} \text{preference}$

$\text{notification}$ table (BCNF)

- Keys:
  - $\text{id}$
- Foreign keys:
  - $\text{user\_id} \xrightarrow{fk} \text{user.id}$
- Functional dependencies:
  - $\text{id} \xrightarrow{fd} \text{title}$
  - $\text{id} \xrightarrow{fd} \text{description}$
  - $\text{id} \xrightarrow{fd} \text{seen}$
  - $\text{id} \xrightarrow{fd} \text{user\_id}$

Although the tables are in the normal form, you may find it beneficial in the future to split the $\text{user}$ table into two tables, one for account information and the other for project allocation (e.g. $\text{accepted}$).
