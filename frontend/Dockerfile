FROM node:18 AS build

ARG BACKEND_URL

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY src /app/src
COPY public /app/public
COPY .env index.html postcss.config.cjs tailwind.config.cjs tsconfig.json tsconfig.node.json vite.config.ts /app

RUN yarn run openapi --input ${BACKEND_URL}/openapi.json --output /app/src/api --client axios

RUN yarn build
RUN yarn global add serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
