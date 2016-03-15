(function() {

  var socket = io();
  var props = [];

  socket.on('message', function(beacon){
    for (var prop in beacon){
        props[prop.identifier] = prop;
    }
    $('#list').append('<li>' +  props.join(":")  + '</li>');
  });

})();
