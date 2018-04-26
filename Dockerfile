FROM node:9.6.0-alpine
RUN mkdir -p /app
WORKDIR /app
RUN apk update && apk upgrade && apk add git
COPY . /app
RUN yarn
ENV NODE_ENV production
RUN yarn build
EXPOSE 3000
CMD [ "yarn", "start" ]