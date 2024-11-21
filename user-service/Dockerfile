FROM node:18-alpine

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "tsconfig.json",  "./"]

COPY ./src ./src

COPY ./data-source.ts ./data-source.ts

RUN yarn install --frozen-lockfile

RUN yarn build

CMD ["sh", "-c", "yarn typeorm:run && yarn start"]

