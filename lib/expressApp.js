var express = require('express'),
    http = require('http');

var app = exports.app = express();

app.get('/', (req, res) =>{
  res.sendFile('C:/Users/wildc/Documents/Git Repos/PodcastNotes/public/index.html');
});
app.get('/style.css', (req, res) =>{
  res.sendFile('C:/Users/wildc/Documents/Git Repos/PodcastNotes/public/style.css');
})

var server = http.createServer(app);
server.listen(9000);