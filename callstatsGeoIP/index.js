var geoip = require('geoip-lite');
var express = require('express');
var validators = require('validators');
var app = express();

app.get('/lookup/:ip', function (req, res) {
    try {
        validators.validateIPv46Address(req.params.ip)
    } catch (error) {
        res.status(400).send('Bad request, IP address not valid');
        return;
    }
    var geoRes = geoip.lookup(req.params.ip);
    if (geoRes){
        res.set('Content-Type','text/json');
        res.send(JSON.stringify(geoRes));
    } else {
        res.status(404).send("NOT FOUND");
    }
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Callstats: Geo micro service listening at http://%s:%s', host, port);
});

