FROM node:carbon

# Create app directory
WORKDIR /usr/src/librenode

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# docker conf
#COPY z_docker/config/00-docker-net/config-common.json ./config/

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# MONGO

RUN mkdir -p /data/db

RUN apt-get update

RUN apt-get install mongodb mongodb-server -y

EXPOSE 27017

# SUPERVISOR

RUN apt-get install -y supervisor

EXPOSE 27999
EXPOSE 27925
EXPOSE 27950

CMD ["/usr/bin/supervisord", "-n"]
