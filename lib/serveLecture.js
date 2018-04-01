var http = require('http'),
    fs = require('fs'),
    stream = require('stream');

var app = null;
var wssconns = null;

var getVideoStream = function(url){
  var interm = new stream.PassThrough(); //the input is the output
                                    //purpose is to delay the method call until all lines are executed in the right ordere
  var req = http.get(url, (res) => {
    res.on('data', (chunk)=>{ //response is data stream
                              //data is the listener and chunk is the data that we want to add
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
        impnotes = JSON.parse(data);
      });
      notes.stdout.on('end', ()=>{
        console.log(startTimes)
        console.log(impNotes)
      })
    })
  });
}

exports.runpys = function(timestampsfile, resultsfile, callback){
  console.log('running pys')
  var spawn = require("child_process").spawn;
  var transcription = fs.createReadStream(timestampsfile)
  var total = "";
  transcription.on('data', (data)=>{
    total+=data;
  });
  transcription.on('end', ()=>{
    startTimes = total.split(" ");
    var results = fs.createReadStream(resultsfile);
    total = "";
    results.on('data', (data)=>{
      total+=data
    });
    results.on('end', ()=>{
      var transcripts = total.split('.');

      //spawn note generator
      console.log('generating notes')
      var notes = spawn('python',["py/NLP.py", resultsfile]);
      impnotes = {};
      notes.stdout.on('data', (data)=>{
        impnotes = JSON.parse(data);
      });
      notes.stdout.on('end', ()=>{
        callback(startTimes, transcripts, impnotes)
      })
    })
  })
}
