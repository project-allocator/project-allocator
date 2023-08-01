FROM python:3.11

RUN apt-get update && apt-get install -y zsh
WORKDIR /app

COPY poetry.lock pyproject.toml ./
RUN pip install poetry==1.5.1 && \
    poetry config virtualenvs.create false && \
    poetry install --no-root

COPY . .

EXPOSE 8000
# Install the CLI commands
RUN poetry install
CMD uvicorn src.main:app --reload --port 8000 --host 0.0.0.0