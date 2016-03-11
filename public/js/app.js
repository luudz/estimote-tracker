(function() {

  var socket = io();

  socket.on('message', function(beacon){
    var props = [];

    for (var prop in beacon){
        props.push(beacon[prop]);
    }

    $('#list').append('<li>' +  props.join(":")  + '</li>');
  });

})();
