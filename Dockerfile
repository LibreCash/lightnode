FROM node:carbon

# Create app directory
WORKDIR /usr/src/librenode

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# docker conf srv
COPY z_docker/config/00-docker-net/config-common.json ./config/default.json

RUN ls && cat ./config/default.json

EXPOSE 27999
EXPOSE 27925
EXPOSE 27950

RUN apt-get update

RUN apt-get install -y supervisor

CMD ["/usr/bin/supervisord", "-n"]
#CMD ["npm", "start"]
