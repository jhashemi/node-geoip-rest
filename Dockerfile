FROM node:5.1.0
RUN mkdir -p /callstats/geoip
ADD ./callstatsGeoIP /callstats/geoip
WORKDIR /callstats/geoip
RUN npm install
EXPOSE  3000
CMD ./runServer.sh