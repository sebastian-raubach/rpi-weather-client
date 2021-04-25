FROM node:12-alpine3.10 AS builder

LABEL maintainer="sebastian@raubach.co.uk"

ARG BRANCH=main

# Force docker to not cache the next line
ADD https://api.github.com/repos/sebastian-raubach/rpi-weather-client/git/refs/heads/main version.json
# Clone the GridScore server code and client code
RUN echo "Pulling GitHub branch: $BRANCH"
RUN apk add --no-cache git && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/rpi-weather-server.git /opt/rpi-weather-server
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/rpi-weather-client.git /opt/rpi-weather-client

# Build the client code
WORKDIR /opt/rpi-weather-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=./api/" > .env && \
    apk add --no-cache python build-base gcc wget && \
    npm i && \
    npm run build && \
    mkdir /opt/rpi-weather-server/client/ && \
    cp -a /opt/rpi-weather-client/dist/. /opt/rpi-weather-server/client/

# Download Gradle and build the server code
RUN apk add --no-cache openjdk11 && \
    wget https://services.gradle.org/distributions/gradle-6.0.1-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-6.0.1-bin.zip -d /opt/ && \
    echo "config.folder=/data/rpi-weather" > /opt/rpi-weather-server/config.properties && \
    echo "project.name=rpi-weather" >> /opt/rpi-weather-server/gradle.properties && \
    /opt/gradle-6.0.1/bin/gradle -p /opt/rpi-weather-server war


FROM tomcat:8-jdk11

LABEL maintainer="sebastian@raubach.co.uk"

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/rpi-weather-server/build/libs/rpi-weather-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/
