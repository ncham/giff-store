FROM node:18.14.2-alpine
WORKDIR /app
RUN npm install -g ionic
CMD ["sh"]