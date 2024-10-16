# Stage 1: Build the React frontend
FROM node:20 AS build-frontend
WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install
COPY frontend/ ./
RUN yarn build



# Stage 2: Set up FastAPI backend
FROM python:3.11 AS backend
RUN apt-get update 
RUN apt-get install -y --no-install-recommends build-essential libpq-dev 
WORKDIR /backend
# Install FastAPI and Uvicorn

COPY backend/pyproject.toml backend/poetry.lock .
RUN pip install poetry 
RUN poetry config virtualenvs.create false && poetry install --no-root --no-interaction --no-ansi
COPY backend/ .
RUN ls -la


# Stage 3: Final stage with NGINX and FastAPI
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-frontend /app/dist /usr/share/nginx/html
COPY --from=backend /backend /



EXPOSE 80
EXPOSE 8000

ENV FASTAPI_ENV=production

CMD /usr/sbin/nginx && poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000