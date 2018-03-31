var ws = new WebSocket('ws://localhost:9000/websocket');

var notes = $('#notes');

var subtitleData = {
  text:[],
  timestamps:[]
};

ws.onmessage = function(event){
  var data = JSON.parse(event.data);
  if(data.tag == 'subtitles'){
    subtitleData.text.push(data.text);
    subtitleData.timestamps.push(data.time);
  }else if(data.tag == 'notes'){
    var bullet = $('p');
    bullet.classed('note-'+data.indent, true)
    bullet.html(data.text);
    notes.append(bullet);
  }
}