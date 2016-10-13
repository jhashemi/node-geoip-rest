#!/bin/bash

# download the data files and store them in the node_modules/geoip-lite/data with proper permission
cd node_modules/geoip-lite/data/;

if [[ "x$GEO_IP_CITY_NAMES_URL" != "x" ]]; then
    curl -o geoip-city-names.dat ${GEO_IP_CITY_NAMES_URL}
fi

if [[ "x$GEO_IP_CITY_URL" != "x" ]]; then
    curl -o geoip-city.dat ${GEO_IP_CITY_URL}
fi

if [[ "x$GEO_IP_CITY6_URL" != "x" ]]; then
    curl -o geoip-city6.dat ${GEO_IP_CITY6_URL}
fi

if [[ "x$GEO_IP_CITY_COUNTRY_URL" != "x" ]]; then
    curl -o geoip-country.dat ${GEO_IP_CITY_COUNTRY_URL}
fi

if [[ "x$GEO_IP_CITY_COUNTRY6_URL" != "x" ]]; then
    curl -o geoip-country6.dat ${GEO_IP_CITY_COUNTRY6_URL}
fi

if [[ "x$GEO_IP_ISP_URL" != "x" ]]; then
    curl -o geoip-isp.dat ${GEO_IP_ISP_URL}
fi

if [[ "x$GEO_IP_ISP6_URL" != "x" ]]; then
    curl -o geoip-isp6.dat ${GEO_IP_ISP6_URL}
fi

cd /callstats/geoip

# Get the new GeoIP ISP file
if [[ "x$GEO_IP2_ISP_URL" != "x" ]]; then
    curl -o GeoIP2-ISP.mmdb ${GEO_IP2_ISP_URL}
fi

#start the geoip service
npm start