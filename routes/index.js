
/*
 * GET home page.
 */

module.exports = function(app){

  app.post('/api/echo', function(req, res){
    var body = req.body;

    if (body.beacons){
      var beacons = body.beacons;
      for (var index = 0; index < beacons.length; index++){
          app.socket.emit("message", beacons[index]);
      }
    }
    res.json ({
      success : true
    });
  });

  app.get('/echo', function(req, res){
      res.render ("index");
  });
}
