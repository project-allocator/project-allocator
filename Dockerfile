FROM node:18

RUN apt-get update && apt-get install -y zsh

RUN groupadd -g 999 app && \
    useradd -m -d /app -r -u 999 -g app app
WORKDIR /app

COPY --chown=app:app package.json yarn.lock ./
RUN yarn --frozen-lockfile
RUN yarn install
RUN chown -R app:app node_modules

COPY --chown=app:app . .
USER 999
EXPOSE 3000
CMD yarn dev --port 3000 --host 0.0.0.0
