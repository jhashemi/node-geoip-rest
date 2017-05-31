/*jslint node: true, esversion: 6 */

'use strict';

var express = require("express");
var prom = require("prom-client");
var Histogram = prom.Histogram;
var Counter = prom.Counter;


var MetricServer = function() {

    var metricsApp = express();
    var metricsServer = require("http").Server(metricsApp);
    var metricsPort = process.env.METRICS_PORT || 9399;

    var httpProcessingTime = new Histogram({
        name: "http_response_time",
        help: "response time for cs-rest-api request handling",
        labelNames: ["event_type", "status_code"],
        register: [],
        buckets: [10, 25, 50, 100, 250, 500, 1000, 2000, 4000, 8000],
    });


    var httpRequestCounter = new Counter({
        name: "http_request_count",
        help: "http request counter for the cs-rest-api module",
        labelNames: ["event_type"],
        register: [],
    });

    var registry = new prom.Registry();
    registry.registerMetric(httpRequestCounter);
    registry.registerMetric(httpProcessingTime);

    // define the routing
    metricsApp.get("/internal/metrics", function(req, res) {
        res.set('Content-Type', registry.contentType);
        res.send(registry.metrics());
    });

    // start to accept traffic on the metric port
    var startServer = function() {
        metricsServer.listen(metricsPort, function(error) {
            if (error) {
                console.error(`failed to listen on metric service port. Error is: ${error}`);
            } else {
                console.info(`start to serve metrics at port ${metricsPort}`);
            }
        });
    };

    var increaseHttpRequestCount = function(labelContext) {
        httpRequestCounter.inc(labelContext);
    };

    var trackHttpResponseTime = function(processTime, labelContext) {
        httpProcessingTime.observe(labelContext, processTime);
    };

    var getMetrics = function() {
        return registry.metrics();
    };

    // Express middleware method to add a timestamp to the incoming request
    var addRequestTime = function(req, res, next) {
        increaseHttpRequestCount();

        // tag the request with the received time
        req.x_requestTimer = process.hrtime();
        next();
    };

    // Express middleware method to calculate the response time
    var measureResponseTime = function(req, res, next) {
        if (req.hasOwnProperty('x_requestTimer')) {
            var responseTimer = process.hrtime(req.x_requestTimer);
            var responseTimeInMs = (responseTimer[0] + (responseTimer[1] / 1000000000)) * 1000;

            trackHttpResponseTime(responseTimeInMs, {
                "status_code": res.statusCode
            });

            next();
        }

    };


    return {
        startServer: startServer,
        addRequestTime: addRequestTime, // middleware handler
        measureResponseTime: measureResponseTime,  // middleware handler
        getMetrics: getMetrics
    };
};

module.exports = {
    MetricServer: MetricServer
};