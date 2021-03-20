# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# default location for angles api
ENV REACT_APP_ANGLES_API_URL http://127.0.0.1:3000

# default port to run on.
ENV PORT 3001

EXPOSE 3001/tcp

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# add app
COPY . ./

# start app
CMD ["npm", "run-script", "start"]
