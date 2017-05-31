FROM node:6.10.3
RUN mkdir -p /callstats/geoip
ADD ./callstatsGeoIP /callstats/geoip/
WORKDIR /callstats/geoip
RUN npm install
EXPOSE  3000 9399
CMD ./runServer.sh