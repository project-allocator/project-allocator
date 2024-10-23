FROM node:18 AS build

ARG BACKEND_URL
ARG TENANT_ID
ARG APP_CLIENT_ID

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY src /app/src
COPY public /app/public
COPY index.html postcss.config.cjs tailwind.config.cjs tsconfig.json tsconfig.node.json vite.config.ts /app

RUN yarn run openapi --input ${BACKEND_URL}/openapi.json --output /app/src/api --client axios

RUN VITE_TENANT_ID=$TENANT_ID VITE_APP_CLIENT_ID=$APP_CLIENT_ID yarn build
RUN yarn global add serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
