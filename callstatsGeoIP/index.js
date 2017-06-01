/*jslint node: true */
"use strict";

var geoipLite = require('geoip-lite');
var express = require('express');
var validators = require('validators');
var app = express();

var maxmind = require('maxmind');
var geoip = maxmind.openSync('GeoIP2-ISP.mmdb');

// scream before crash
process.on('uncaughtException', function(err) {
    var errorMsg = (new Date()).toUTCString() + ' uncaughtException: ' + err.message;
    console.error(errorMsg);
    console.error(err.stack);
    process.exit(1);
});

// the metric collection and reporting service
var Metrics = require("./metrics.js");
var metricServer = Metrics.MetricServer();

// add the metrics tracking middleware for handling request
app.use(metricServer.addRequestTime);

app.get('/lookup/:ip', function (req, res, next) {
    try {
        validators.validateIPv46Address(req.params.ip);
    } catch (error) {
        res.set('Content-Type','application/json');
        res.status(400).send(JSON.stringify({error: 'Bad request, IP address not valid'}));
        return;
    }

    // IP -> geolocation
    var lookupResult = geoipLite.lookup(req.params.ip);
    // IP -> ISP info
    var isp = geoip.get(req.params.ip);

    if (lookupResult || isp) {
        var result = Object.assign({}, lookupResult, isp);
        res.set('Content-Type','application/json');
        res.send(JSON.stringify(result));
    } else {
        res.set('Content-Type','application/json');
        res.status(404).send(JSON.stringify({error: 'NOT FOUND'}));
    }

    // call the next route handler or middleware
    next();
});


// add the metrics tracking middleware for response handling
app.use(metricServer.measureResponseTime);

// start geoip service
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Callstats: Geo micro service listening at http://%s:%s', host, port);
});

// start serving metrics reporting
metricServer.startServer();
