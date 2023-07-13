# Fast API Docker

Enter the container: 
```bash
~$ docker compose up -d
~$ docker compose exec -it web /bin/bash
```

Inside the container:

```bash
~$ poetry run alembic current
```

https://fastapi.tiangolo.com/tutorial/bigger-applications/
https://fastapi.tiangolo.com/deployment/docker/
https://towardsdatascience.com/python-database-migrations-for-beginners-getting-started-with-alembic-84e4a73a2cca
https://fastapi.tiangolo.com/tutorial/sql-databases/#migrations
