var http = require('http'),
    stream = require('stream');

exports.getVideoStream = function(url){
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