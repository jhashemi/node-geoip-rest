var geoipLite = require('geoip-lite');
var express = require('express');
var validators = require('validators');
var app = express();

var maxmind = require('maxmind');
var geoip = maxmind.open('GeoIP2-ISP.mmdb');

app.get('/lookup/:ip', function (req, res) {
    try {
        validators.validateIPv46Address(req.params.ip)
    } catch (error) {
        res.set('Content-Type','application/json');
        res.status(400).send(JSON.stringify({error: 'Bad request, IP address not valid'}));
        return;
    }

    // IP -> geolocation
    var lookupResult = geoipLite.lookup(req.params.ip);
    // ISP from the IP
    var isp = geoip.get(req.params.ip);

    if (lookupResult || isp) {
        var result = Object.assign({}, lookupResult, isp);
        res.set('Content-Type','application/json');
        res.send(JSON.stringify(result));
    } else {
        res.set('Content-Type','application/json');
        res.status(404).send(JSON.stringify({error: 'NOT FOUND'}));
    }
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Callstats: Geo micro service listening at http://%s:%s', host, port);
});

