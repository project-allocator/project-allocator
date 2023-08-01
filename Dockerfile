FROM node:18

RUN apt-get update && apt-get install -y zsh

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000
CMD yarn dev --port 3000 --host 0.0.0.0
