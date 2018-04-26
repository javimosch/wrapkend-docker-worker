
FROM node:9.6.0-alpine

RUN mkdir -p /app
WORKDIR /app
RUN apk update && apk upgrade && apk add git

COPY . /app
RUN yarn

ARG API_URL=http://149.202.161.204
ENV API_URL $API_URL

ENV NODE_ENV production

RUN yarn build

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "yarn", "start" ]