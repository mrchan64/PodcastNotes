$('#theform').submit(function (evt) {
  evt.preventDefault();
  var val = $('#field').val();

  if(val.length==0)return;  $('#center-stage').animate({opacity:0}, 400, 'easeInCubic', ()=>{
    window.location.replace(window.location+'loader/?url='+encodeURIComponent(val))
  })
});

var demo1 = function(){
  $('#center-stage').animate({opacity:0}, 400, 'easeInCubic', ()=>{
    window.location.replace(window.location+'loader/?url=http%3A%2F%2Fpodcast-media.ucsd.edu%2FPodcasts%2Fwi18%2Fcse105_a00%2Fcse105_a00_wi18-03162018-0800.mp4')
  })
}

var demo2 = function(){
  $('#center-stage').animate({opacity:0}, 400, 'easeInCubic', ()=>{
    window.location.replace(window.location+'loader/?url=http%3A%2F%2Fpodcast-media.ucsd.edu%2FPodcasts%2Fwi18%2Fbieb130_a00%2Fbieb130_a00_wi18-02152018-1100.mp4')
  })
}

var demo3 = function(){
  $('#center-stage').animate({opacity:0}, 400, 'easeInCubic', ()=>{
    window.location.replace(window.location+'loader/?url=http%3A%2F%2Fpodcast-media.ucsd.edu%2FPodcasts%2Fwi18%2Fusp143_a00%2Fusp143_a00_wi18-03132018-0930.mp4')
  })
}