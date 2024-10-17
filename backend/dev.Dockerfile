FROM python:3.11

ENV POETRY_VIRTUALENVS_CREATE=false
WORKDIR /api

# Install required system dependencies
RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential libpq-dev 

RUN pip install poetry
COPY pyproject.toml poetry.lock /api/
RUN poetry install --no-root --no-interaction --no-ansi

COPY .env alembic.ini main.py /api/
COPY src /api/src
COPY migrations /api/migrations
