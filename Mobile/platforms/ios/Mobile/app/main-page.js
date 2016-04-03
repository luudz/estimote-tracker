var observableModule = require("data/observable");
var observableArrayModule = require("data/observable-array");
var frameModule = require('ui/frame');

var Estimote = require('nativescript-estimote-sdk');

var Sqlite = require( "nativescript-sqlite" );

var http = require("http");

var data = new observableModule.Observable();

function pageLoaded(args) {
    var page = args.object;
    if (page.ios) {

      var controller = frameModule.topmost().ios.controller;

      // show the navbar
      frameModule.topmost().ios.navBarVisibility = "always";

      // set the title
      page.ios.title = 'Estimote Beacons';

      var navigationBar = controller.navigationBar;

      // set bar color to system blue constant
      // set bar color to a nice dark blue with RGBA
      navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(157/255, 182/255, 168/255, 1);
      navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);
      navigationBar.barStyle = 1;
    }
    var items = new observableArrayModule.ObservableArray([]);

    data.set("beacons", items);

    var _this = this;

    new Sqlite("Estimote", function (err, db) {
        _this.db = db;

        var options = {
            callback : function(beacons){
              var items =[];
              for (var i = 0; i < beacons.length; i++) {
                 var beacon = beacons[i];
                 if (beacon.major > 0){
                    var distance = "NA";
                    var identifier = "Major:" + beacon.major + " Minor:" + beacon.minor;

                    if (beacon.proximity) {
                      distance = beacon.proximity;
                    }

                    var item = {
                        "proximity" : beacon.proximity,
                        "identifier": identifier,
                        "distance":  "Distance: " + distance,
                        "rssi": "Power: " +  beacon.rssi + "dBm"
                    };

                    items.push(item);

                    _this.db.all("select * from beacon where major=? and minor=?", [beacon.major, beacon.minor], function(err, resultSet){
                        // console.log(resultSet[0]);
                        if (resultSet.length === 0){
                          _this.db.execSQL("insert into beacon (major, minor, data) values (?, ?, ?)", [beacon.major, beacon.minor, JSON.stringify(item)], function(err, id){
                              // console.log("The new record id is:", id);
                          });
                        }
                        else{
                          _this.db.execSQL("update beacon SET data = ? where major = ? and minor = ?", [JSON.stringify(item), beacon.major, beacon.minor], function(err, id){
                              // console.log("The updated record id is:", id);
                          });
                        }
                    });
                 }
              }
              data.set("beacons", new observableArrayModule.ObservableArray(items));
            }
        };

        db.execSQL("CREATE TABLE IF NOT EXISTS beacon (id integer primary key, data text, major integer, minor integer)").then(function(err, id){
          new Estimote(options).startRanging();
        });
    });

    page.bindingContext = data;
}

exports.pageLoaded = pageLoaded;
