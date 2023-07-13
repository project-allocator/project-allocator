FROM node:18-alpine

RUN apk add bash zsh
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
RUN yarn install

COPY . /app
EXPOSE 3000
CMD yarn dev --port 3000 --host 0.0.0.0
