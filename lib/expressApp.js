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

var passthrough = function(startTimes, transcripts, impNotes){
  var data1 = {text:[], time:[]};
  data1.text = transcripts
  data1.time = startTimes;
  data1.tag = "subtitles";
  data1.time.splice(startTimes.length-1, 1);
  wssconns.write(data1);

  var data2 = impNotes;
  var ordering = [];
  Object.keys(data2).forEach((key)=>{
    ordering.push(data2[key]);
  });
  ordering.sort((a,b)=>{
    if(a.label<b.label){
      return -1;
    }
    if(a.label==b.label && a.wavnum<b.wavnum){
      return -1;
    }
    return 1;
  })
  data2 = {};
  for(var i = 0; i<ordering.length; i++){
    data2['note'+i] = ordering[i];
  }

  var proc = [];
  var max = -20;
  var min = Number.MAX_SAFE_INTEGER;
  var currlabel = -1
  Object.keys(data2).forEach((key)=>{
    subdata = data2[key];
    if(subdata.label!=currlabel){
      unit = Math.ceil((max+1-min)/4);
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
  unit = Math.ceil((max+1-min)/3);
  proc.forEach((sub)=>{
    sub.score = Math.floor((sub.score-min)/unit);
    if(sub.score>3)sub.score = 3;
  })
  wssconns.write({
    tag: "notes",
    notes: data2
  })
}