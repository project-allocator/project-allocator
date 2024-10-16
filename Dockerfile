# Stage 1: Build the React frontend
FROM node:20 AS build-frontend
WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install
COPY frontend/ ./
RUN yarn build


# Stage 2: Set up FastAPI backend
FROM python:3.11-slim AS backend
# ENV POETRY_VIRTUALENVS_IN_PROJECT=true
WORKDIR /app

# Install system dependencies
RUN apt-get update 
RUN apt-get install -y --no-install-recommends build-essential libpq-dev nginx

# Install API dependencies
COPY backend/pyproject.toml backend/poetry.lock .
RUN pip install poetry 
RUN poetry install --no-root --no-ansi --no-interaction

# Copy over API source code
COPY backend/src ./src
COPY backend/logs ./logs
COPY backend/.env .

# Configure NGINX (reverse proxy)
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-frontend /app/dist /usr/share/nginx/html

CMD nginx && poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000
