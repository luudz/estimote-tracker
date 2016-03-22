(function() {
  var socket = io();
  var props = [];

  $('#list').empty();

  socket.on('message', function(beacon){

    var propString = Object.keys(beacon).map(function(x){return beacon[x];}).join(":");

    $('#list').append('<li>' +  propString  + '</li>');
  });

})();
