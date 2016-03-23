(function() {
  var socket = io();
  var beacons = [];

  $('#list').empty();
  
  socket.on('message', function(beacon){

    var summary = Object.keys(beacon).map(function(x){return beacon[x];}).join(": ");

    var identifier = escape(beacon.identifier);

    console.log(identifier);

    if (!beacons[identifier]){
      $('#list').append("<li id="+ identifier + ">" +  summary  + "</li>");
      beacons[identifier] = summary;
    }
  });

})();
