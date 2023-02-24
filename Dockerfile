FROM node:18-alpine

RUN apk add ffmpeg && mkdir /src

WORKDIR /src

COPY ./package.json .

RUN npm install

COPY . .

CMD ["bin", "sh"]
