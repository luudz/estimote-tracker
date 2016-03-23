(function() {
  var socket = io();
  var beacons = [];

  $('#list').empty();

  socket.on('message', function(beacon){

    var summary = Object.keys(beacon).map(function(x){return beacon[x];}).join(": ");

    var identifier = beacon.identifier.replace(/[\s:]+/ig, "-");

    if (!beacons[identifier]){
      $('#list').append("<li id="+ identifier + ">" +  summary  + "</li>");
    }
    else {
        console.log("updated" + summary);
        $("#list").find("#" + identifier).html(summary);
    }

    beacons[identifier] = summary;
  });

})();
