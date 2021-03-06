var ws = new WebSocket('ws://'+window.location.host+'/websocket');

var notesArr = [];
//var notes = $('#notes');

var subtitleTags = [];

var dictionary = {};
var chrononotes = {};
var index = 0;


var subtitleData = {
  text:[],
  timestamps:[]
};

ws.onmessage = function(event){
  var data = JSON.parse(event.data);
  console.log(data)
  if(data.tag == 'subtitles'){
    subtitleData.text = data.text;
    subtitleData.timestamps = data.time;
    printSubtitle();
  }else if(data.tag == 'notes'){
    dictionary = data.notes;
    Object.keys(dictionary).forEach((key)=>{
      chrononotes[dictionary[key].wavnum] = key;
    });
    printNotes();
  }
}

setTimeout(function(){
    var video = document.getElementById('inplayer_html5_api');

    video.ontimeupdate = function(){timeOnVideo(video)};

}, 1000);



function timeOnVideo(video){
  var time = video.currentTime;

  for( var i = 0; i<subtitleData.text.length; i++){
    if(time<subtitleData.timestamps[i]){
      i = i-1;
      console.log(i)
      $('#belowbar').animate({scrollTop: subtitleTags[i].prop("offsetTop")-10}, 100);
      var order = chrononotes[i];
      if(order){
        var target = $('#wave'+dictionary[order].wavnum);
        if(!target.hasClass('hightlight')){
          $('li').removeClass('highlight');
          target.addClass('highlight');
        }
      }

      break;
    }
  }

  //$().text(currentTime)
  //$().text(duration)

}

function printSubtitle(){
  console.log("Printing subtitles")
  subtitleData.text.forEach((text)=>{
    var curTag = $("<p>"+ text+"</p>");
    subtitleTags.push(curTag);
    $('#belowbar').append(curTag);
  })
}

function printNotes(){
  console.log("Printing Notes")
  // by topic
  var notes = $('#notes');
  $('.notelist').remove();
  var level = -1;
  var s = ""
  Object.keys(dictionary).forEach((key)=>{
    while(level<dictionary[key].score){
      level+=1;
      s+="<ul>";
    }
    while(level>dictionary[key].score){
      level-=1;
      s+="</ul>";
    }
    s+="<li id='wave"+dictionary[key].wavnum+"'>"+dictionary[key].text+"</li>";
  })
  while(level>-1){
    level-=1;
    s+="</ul>";
  }
  s = $(s);
  s.addClass('notelist');
  notes.append(s);
  $('li').on('click', becomeInput);
  $('#notes').on('click', closeAlltf);
}

function becomeInput(event){
  event.stopPropagation();
  var elem = $(this);
  if(elem.find('textarea')[0])return;
  var height = elem.height();
  var width = elem.width();
  var data = elem.html();
  elem.empty();
  elem.addClass('changed');
  var tf = $('<textarea></textarea>');
  tf.css({
    height: height+15,
    width: width-16,
    margin: '4px'
  });
  tf.html(data);
  elem.append(tf);
}

function closeAlltf(event){
  console.log('closing')
  $('li').each((ind, elem)=>{
    var elem = $(elem);
    console.log(elem);
    if(elem.find('textarea')[0]){
      var val = elem.find('textarea').val();
      elem.empty();
      elem.html(val);
    }
  })
}