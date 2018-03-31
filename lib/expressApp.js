var express = require('express'),
    ws      = require('ws'),
    path    = require('path'),
    http    = require('http');

var app = exports.app = express();
exports.app.use('/public', express.static(path.join(__dirname, '../public')));
exports.app.set('views', path.join(__dirname, '../public'));

app.get('/', (req, res) =>{
  console.log(req.query.url);
  res.render(path.join(__dirname, '../public/index.jade'),{url: req.query.url});
});

var server = http.createServer(app);

exports.wss = new ws.Server({server, path: '/websocket'});

var wssconns = exports.wssconns = [];
exports.wss.on('connection', function(client) {
  wssconns.push(client);
  client.on('message', function(msg){
    msg = JSON.parse(msg);
    console.log(msg,'\n');
  });
  client.on('close', function(){
    wssconns.splice(wssconns.indexOf(client), 1);
  });
});

wssconns.write = function(data){
  wssconns.forEach(function(conn){
    conn.send(JSON.stringify(data));
  });
}

server.listen(9000);