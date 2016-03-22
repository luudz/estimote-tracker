(function() {
  var socket = io();
  var props = [];

  socket.on('message', function(beacon){

    $('#list').empty();

    console.log(Object.keys(beacon));

    var propString = Object.keys(beacon).map(function(x){return beacon[x];}).join(":");

    $('#list').append('<li>' +  propString  + '</li>');
  });

})();
