FROM node:18-alpine

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "tsconfig.json", "./"]

#COPY package*.json ./
#COPY yarn.lock ./
#COPY tsconfig*.json ./
COPY ./src ./src

RUN yarn install --frozen-lockfile

RUN yarn build

CMD ["yarn", "start"]

