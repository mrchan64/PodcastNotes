var http = require('http'),
    fs = require('fs'),
    stream = require('stream');

var app = null;
var wssconns = null;

var getVideoStream = function(url){
  var interm = new stream.PassThrough();
  var req = http.get(url, (res) => {
    res.on('data', (chunk)=>{
      interm.write(chunk);
    });
    res.on('end', ()=>{
      interm.end();
    });
  })
  req.end();
  return interm;
}

exports.setUp = function(express, wssconns){
  app = express;
  wssconns = wssconns;
}

var startTimes = exports.startTimes = [];
var impNotes = exports.impNotes = {};

exports.processVideo = function(url){
  var streamIn = getVideoStream(url);
  var streamOut = fs.createWriteStream('transcribe.mp4');

  var datalength = 0;
  var nextTime = new Date().getTime();
  var start = nextTime;
  streamIn.on('data', (chunk)=>{
    datalength+=chunk.length;
    var now = new Date().getTime();
    var diff = now-nextTime
    if(diff>0){
      var time = now - start;
      var kilo = 1024;
      var mega = kilo*1024;
      var giga = mega*1024;
      console.log(Math.floor(time/60000)+'m \t'+Math.floor((time%60000)/1000)+'s \t'+Math.floor(datalength/giga)+'GB \t'+Math.floor((datalength%giga)/mega)+'MB \t'+Math.floor((datalength%mega)/kilo)+'KB \t'+Math.floor(datalength%kilo)+'B');
      nextTime+=1000;
    }
  })
  streamIn.on('end', ()=>{
    var now = new Date().getTime();
    var time = now - start;
    var kilo = 1024;
    var mega = kilo*1024;
    var giga = mega*1024;
    console.log(Math.floor(time/60000)+'m \t'+Math.floor((time%60000)/1000)+'s \t'+Math.floor(datalength/giga)+'GB \t'+Math.floor((datalength%giga)/mega)+'MB \t'+Math.floor((datalength%mega)/kilo)+'KB \t'+Math.floor(datalength%kilo)+'B');
    console.log('Download complete!')
  })

  streamIn.pipe(streamOut);
  streamOut.on('end', ()=>{
    var spawn = require("child_process").spawn;
    var transcription = spawn('python',["../py/AudioWS.py", "../transcribe.mp4"]);
    startTimes = [];
    transcription.stdout.on('data', (data)=>{
      var start = data;
      startTimes.push(start);
    });
    transcription.stdout.on('end', ()=>{
      //spawn note generator
      var notes = spawn('python',["../py/NLP.py"]);
      impnotes = {};
      notes.stdout.on('data', (data)=>{
        impnotes = data;
      });
      notes.stdout.on('end', ()=>{
        console.log(startTimes)
        console.log(impNotes)
      })
    })
  });
}

var runpys = function(filename, callback){
  streamIn.pipe(streamOut);
  streamOut.on('end', ()=>{
    var spawn = require("child_process").spawn;
    var transcription = spawn('python',["../py/AudioWS.py", "../"+filename]);
    startTimes = [];
    transcription.stdout.on('data', (data)=>{
      var start = data;
      startTimes.push(start);
    });
    transcription.stdout.on('end', ()=>{
      //spawn note generator
      var notes = spawn('python',["../py/NLP.py"]);
      impnotes = {};
      notes.stdout.on('data', (data)=>{
        impnotes = data;
      });
      notes.stdout.on('end', ()=>{
        callback(startTimes, impNotes)
      })
    })
  });
}

runpys();