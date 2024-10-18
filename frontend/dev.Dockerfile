FROM node:18

WORKDIR /app

COPY package.json yarn.lock /app
RUN yarn install --frozen-lockfile

COPY src /app/src
COPY public /app/public
COPY docker-entrypoint.sh /app
COPY .env index.html postcss.config.cjs tailwind.config.cjs tsconfig.json tsconfig.node.json vite.config.ts /app

EXPOSE 3000
ENTRYPOINT ./docker-entrypoint.sh
