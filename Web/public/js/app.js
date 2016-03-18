(function() {
  var socket = io();
  var props = [];

  socket.on('message', function(beacon){

    $('#list').empty();

    for (var prop in beacon){
        console.log(prop);
        props[prop.identifier] = prop;
    }

    console.log(Object.keys(props));

    var propString = Object.keys(props).map(function(x){return props[x];}).join(":");

    $('#list').append('<li>' +  propString  + '</li>');
  });

})();
