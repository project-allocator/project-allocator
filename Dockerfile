FROM node:18

RUN groupadd -g 999 app && \
    useradd -m -r -u 999 -g app app
RUN chown -R app:app /home/app
WORKDIR /home/app

RUN apt-get update && apt-get install -y zsh
RUN touch .zshrc

COPY --chown=app:app package.json yarn.lock ./
RUN yarn --frozen-lockfile
RUN yarn install
RUN chown -R app:app node_modules

COPY --chown=app:app . .
USER 999
EXPOSE 3000
CMD yarn dev --port 3000 --host 0.0.0.0
