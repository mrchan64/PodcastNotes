$('#theform').submit(function (evt) {
  evt.preventDefault();
  var val = $('#field').val();
  if(val.length==0)return;
  $('#center-stage').animate({opacity:0}, 400, 'easeInCubic', ()=>{
    window.location.replace(window.location+'?url='+encodeURIComponent(val))
  })
});