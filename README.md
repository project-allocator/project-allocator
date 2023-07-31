# Project Allocator v3

## Frontend

## Backend 

### Entering the container

```bash
~$ docker compose up -d frontend
~$ docker compose up -d backend
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

### Useful links

https://fastapi.tiangolo.com/deployment/docker/
https://fastapi.tiangolo.com/tutorial/bigger-applications/
https://sqlmodel.tiangolo.com/tutorial/select/
https://github.com/tiangolo/sqlmodel/issues/85#issuecomment-917228849

https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/7792be17-89fd-4934-9917-6ac583c592a8
https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/63a21108-fc4f-4c7d-a2cb-ec8836bbbcfd

https://intility.github.io/fastapi-azure-auth/single-tenant/fastapi_configuration#adding-authentication-to-our-view
https://intility.github.io/fastapi-azure-auth/usage-and-faq/calling_your_apis_from_python
https://learn.microsoft.com/en-us/azure/active-directory/develop/single-page-app-tutorial-01-register-app
https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial/tree/main/3-Authorization-II/1-call-api