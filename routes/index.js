
/*
 * GET home page.
 */

module.exports = function(app){

  app.post('/api/echo', function(req, res){
    var body = req.body;

    if (body.major > 1){
        app.socket.emit("message", body);
    }
    res.json ({
      success : true
    });
  });

  app.get('/echo', function(req, res){
      res.render ("index");
  });
}
