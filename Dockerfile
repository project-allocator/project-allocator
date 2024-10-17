# Stage 1: Build the React frontend
FROM node:20 AS build-frontend
WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install
COPY frontend/ ./
RUN yarn build

# Stage 2: Set up FastAPI backend and serve stack via NGINX
FROM python:3.11-slim 

ENV POETRY_VIRTUALENVS_IN_PROJECT=true

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

RUN groupadd -g 999 app && \
    useradd -m -d /app -r -u 999 -g app app
RUN chown -R app:app /app && chmod -R 755 /app && \
    chown -R app:app /var/lib/nginx && \
    chown -R app:app /var/log/nginx && \
    chown -R app:app /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R app:app /var/run/nginx.pid

USER app

# RUN touch /var/run/nginx.pid 
RUN mkdir -p /var/lib/nginx/proxy
RUN mkdir -p /var/lib/nginx/body
RUN mkdir -p /var/lib/nginx/fastcgi
RUN mkdir -p /var/lib/nginx/uwsgi
RUN mkdir -p /var/lib/nginx/scgi
# RUN chown -R www-data:www-data /var/lib/nginx 
# RUN chown -R www-data:www-data /var/log/nginx 
# RUN chown -R www-data:www-data /app
# RUN chown www-data:www-data /var/run/nginx.pid
# RUN chmod -R 777 /var/log/nginx 

EXPOSE 8080

# USER www-data

CMD /usr/sbin/nginx && poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000
