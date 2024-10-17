FROM python:3.11

ENV POETRY_VIRTUALENVS_CREATE=false
ENV FASTAPI_ENV=production

WORKDIR /api

# Install required system dependencies
RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential libpq-dev 

# Install project dependencies
RUN pip install poetry
COPY pyproject.toml poetry.lock /api/
RUN poetry install --no-root --no-interaction --no-ansi

COPY .env main.py /api/
COPY src /api/src

EXPOSE 8000

CMD fastapi run --port 8000 --host 0.0.0.0
