var express = require('express'),
    ws      = require('ws'),
    path    = require('path'),
    http    = require('http');

var app = exports.app = express();
exports.app.use('/public', express.static(path.join(__dirname, '../public')));
exports.app.set('views', path.join(__dirname, '../public'));

exports.wscallback = function(a){console.log("something wasn't changed")};

app.get('/', (req, res) =>{
  if(!req.query.url)res.render(path.join(__dirname, '../public/home.jade'));
  else res.render(path.join(__dirname, '../public/index.jade'),{url: req.query.url});
  if(req.query.url == "http://podcast-media.ucsd.edu/Podcasts/wi18/cse105_a00/cse105_a00_wi18-03162018-0800.mp4"){
    exports.wscallback('demotime1.txt','demoresult1.txt', passthrough);
  } 
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

var passthrough = function(startTimes, impNotes){
  var data1 = {text:[], time:[]};
  data1.time = startTimes.splice(0,startTimes.length()/2);
  data1.text = startTimes;
  data1.tag = "subtitles";
  wssconns.write(data1);
  var data2 = impNotes;
  var proc = [];
  var max = -20;
  var min = Number.MAX_SAFE_INTEGER;
  var currlabel = -1
  Object.keys(data2).forEach((subdata)=>{
    if(subdata.label!=currlabel){
      unit = Math.ceil((max+1-min)/3);
      proc.forEach((sub)=>{
        sub.score = Math.floor((sub.score-min)/unit);
        if(sub.score>3)sub.score = 3;
      })
      proc = [];
      currlabel = subdata.label;
    }else{
      if(subdata.score<min)min = subdata.score;
      if(subdata.score>max)max = subdata.score;
    }
    proc.push(subdata)
  });
  wssconns.write({
    tag: "notes",
    notes: data2
  })
}