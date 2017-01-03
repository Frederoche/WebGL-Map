var express         = require('express');
var app             = express();
var http            = require('http');
var compression     = require('compression');

var router          = express.Router();

app.use(express.static('Client'));

var agent = new http.Agent({
  keepAlive: true,
  maxSockets: 100000,
  keepAliveMsecs: 3000
});

var get = function(url, callback) {

    http.get(url, function(res) {

        var output = '';
        res.setEncoding('binary');
        
        res.on('data', function(chunck) {
            output += chunck;
        });

        res.on('end', function () {

            callback(output);
        });
    });
};


app.use(compression());
app.set('view cache', true);

app.get('/image/', function (req, res)
{    
    var url = req.originalUrl.split("server=")[1];

    console.log(url);

    get(url, function (result) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length':result.length,'Cache-Control':'public, max-age:31536000' });
        
        res.end(result, 'binary');
    });

});

app.use('*', function(req, res) {
    res.send('index.html')
});

app.listen(8000);
console.log("listen To port 8000");