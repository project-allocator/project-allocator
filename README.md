# Project Allocator v3

Enter the container: 
```bash
~$ docker compose up -d frontend
~$ docker compose up -d backend
~$ docker compose exec -it backend /bin/bash
```

Inside the container:

Check the database connection:

```bash
~$ poetry run alembic current
```

Create a new revision:

```bash
~$ poetry run alembic revision -m "Your Revision Message"
~$ poetry run alembic upgrade head
~$ poetry run alembic history
```

```bash
~$ poetry run downgrade -1
~$ poetry run downgrade base
```

https://fastapi.tiangolo.com/deployment/docker/
https://fastapi.tiangolo.com/tutorial/bigger-applications/
https://sqlmodel.tiangolo.com/tutorial/select/
https://github.com/tiangolo/sqlmodel/issues/85#issuecomment-917228849
https://intility.github.io/fastapi-azure-auth/single-tenant/fastapi_configuration#adding-authentication-to-our-view