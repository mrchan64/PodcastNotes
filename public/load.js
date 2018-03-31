var showAll = function() {
  var order = [];
  order.push($('#title'));
  order.push($('#player'));
  order.push($('#belowbar'));
  order.push($('#notes'));

  var counter = 0;
  order.forEach( el => {
    el.css('opacity', 0);
    setTimeout(()=>{
      el.css('display', 'block');
      el.animate({'opacity': 1}, 200, 'easeOutCubic');
    }, counter);
    counter+=50;
  });
}
showAll();