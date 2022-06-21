FROM node:16-alpine

COPY . .
RUN npm install

ENV NODE_ENV=dev
CMD ["npm", "start"]
