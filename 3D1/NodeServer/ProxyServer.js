var express = require('express');
var app = express();
var http = require('http');

var router = express.Router();

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
app.use(express.static('HTMLPages', { extensions: ['html', 'htm'] }))
app.use('*',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; .NET CLR 1.0.3705;)");
    res.send('index.html');
    next();
});


app.get('/image/', function (req, res)
{
    var url = req.originalUrl.split("server=")[1];
    console.log(url);

    get(url, function (result) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(result, 'binary');
    });

});

app.listen(8000);
console.log("listen To port 8000");


