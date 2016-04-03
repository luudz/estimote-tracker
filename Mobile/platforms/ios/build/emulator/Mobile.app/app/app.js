
var application = require("application");

var Sqlite = require( "nativescript-sqlite" );

application.cssFile = "./app.css";
application.mainModule = "main-page";

var http = require('http');

var CLLocationManagerDelegateImpl = (function (_super) {
    __extends(CLLocationManagerDelegateImpl, _super);
    function CLLocationManagerDelegateImpl() {
        _super.apply(this, arguments);
    }
    CLLocationManagerDelegateImpl.new = function () {
        return _super.new.call(this);
    };

    CLLocationManagerDelegateImpl.prototype.locationManagerDidUpdateLocations = function(manager, locations) {

    };

    CLLocationManagerDelegateImpl.prototype.locationManagerDidChangeAuthorizationStatus = function(manager, status) {
        manager.startUpdatingLocation();
    };

    CLLocationManagerDelegateImpl.ObjCProtocols = [CLLocationManagerDelegate];

    return CLLocationManagerDelegateImpl;
})(NSObject);

var AppDelegate = (function (_super) {
    __extends(AppDelegate, _super);
    function AppDelegate() {
        _super.apply(this, arguments);
    }

    AppDelegate.prototype.applicationDidFinishLaunchingWithOptions = function(application, options) {

        this.locationManagerDelegate = CLLocationManagerDelegateImpl.new().init();
        this.locationManager = CLLocationManager.alloc().init();
        this.locationManager.delegate = this.locationManagerDelegate;
        this.locationManager.distanceFilter = 100;

        this.locationManager.requestAlwaysAuthorization();

        return true;
    };

    AppDelegate.prototype.applicationPerformFetchWithCompletionHandler = function(application, handler){
          new Sqlite("Estimote", function (err, db) {
              db.all("select * from beacon", [], function(err, resultSet){

                for (var index = 0; index < resultSet.length; index++){
                  var data = resultSet[index][1];

                  console.log(JSON.parse(data).rssi);

                  console.log(data);

                  var promise = http.request({
                       url : "https://estimote-beacon-tracker.herokuapp.com/api/echo",
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       content : data
                   });

                   promise.then(function(result){
                       console.log(JSON.stringify(result));
                   }, function (error){
                       console.error(JSON.stringify(error));
                   });
                }
              });
          });

         handler(UIBackgroundFetchResult.NewData);
    };

    AppDelegate.ObjCProtocols = [UIApplicationDelegate];
    return AppDelegate;
})(UIResponder);
application.ios.delegate = AppDelegate;
// END 3DTouch wiring

application.start();
