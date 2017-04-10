var express = require('express');
var app = express();
var http = require('http');


var router = express.Router();

app.use(express.static('Client'));



var get = function(url, callback) {

    http.get(url, function(res) {

        var output = '';
        res.setEncoding('binary');

        res.on('data', function(chunck) {
            output += chunck;
        });

        res.on('end', function() {

            callback(output);
        });
    });
};



app.set('view cache', true);

app.get('/image/', function(req, res) {
    var url = req.originalUrl.split("server=")[1];

    console.log(url);

    get(url, function(result) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age:86400', 'ETag': 'x234dff' });

        res.end(result, 'binary');
    });

});

app.use('*', function(req, res) {
    res.send('index.html')
});

var port = process.env.PORT || 8000

app.listen(port);
console.log("listen To port" + port);