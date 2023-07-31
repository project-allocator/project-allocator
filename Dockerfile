FROM python:3.11

RUN groupadd -g 999 app && \
    useradd -m -r -u 999 -g app app
RUN chown -R app:app /home/app
WORKDIR /home/app

RUN apt-get update && apt-get install -y zsh
RUN touch .zshrc

COPY --chown=app:app poetry.lock pyproject.toml ./
RUN pip install poetry==1.5.1
RUN poetry config virtualenvs.create false 
RUN poetry install --no-root
RUN poetry self add uvicorn

COPY --chown=app:app . .
USER 999
EXPOSE 8000
# Install the CLI commands
RUN poetry install
CMD poetry run uvicorn src.main:app --reload --port 8000 --host 0.0.0.0
