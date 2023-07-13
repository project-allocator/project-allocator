FROM python:3.11

RUN pip install poetry==1.5.1
WORKDIR /app

COPY poetry.lock pyproject.toml ./
RUN poetry install --no-root
RUN poetry self add uvicorn

COPY . /app
EXPOSE 8000
CMD poetry run uvicorn src.main:app --reload --port 8000 --host 0.0.0.0
