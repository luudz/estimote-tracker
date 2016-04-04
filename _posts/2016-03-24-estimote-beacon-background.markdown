---
layout: post
title:  "How to Monitor Estimote Beacon in Background"
date:   2016-03-24 13:57:34 -0700
categories: estimote beacon ios
---

Estimote Beacon is a super small device. It has a powerful 32-bit ARM® Cortex M0 CPU with 256kB flash memory, accelerometer, temperature sensor and most importantly – a 2.4 GHz Bluetooth 4.0 Smart (also known as BLE or Bluetooth low energy) bidirectional radio.


This document will guide you through the process of installing a NativeScript plugin and then enabling background fetch of iOS to sync it back to a tracker portal.

This document assumes that the reader is familiar with NativeScript and knows how to create a basic app. More information on NativeScript is provided at the end of this document.  

One you have the app configured first step is to install the plugin which is publicly available as a npm package. In order to install the plugin execute the following command from the root of your native-script app:

    tns plugin add nativescript-estimote-sdk


The Core Location framework in iOS provides two ways of monitoring user’s entry and exit into specific region:

1. Geographical Region Monitoring
2. Beacon Region Monitoring

More information on this can be found in the link below:

[Apple Region Monitoring - Documentation](
https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html#//apple_ref/doc/uid/TP40009497-CH9-SW1)

We are interested in monitoring user’s location using beacon monitoring via bluetooth low energy. Once you have the estimote NativeScript plugin installed, you can turn on beacon monitoring in the following way:


    var Sqlite = require( "nativescript-sqlite" );
    var Estimote = require('nativescript-estimote-sdk');


    var options = {
      region : 'Progress', // optional
      callback : function(beacons){
              for (var i = 0; i < beacons.count; i++) {
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

                // store the beacon information in device storage using SQLite plugin.
             }
        }
    }

    new Estimote(options).startRanging();


Here to note that I have also used SQLite plugin to initially store the beacon in device storage. In order to install SQLite plugin please execute the following command:

tns plugin add nativescript-sqlite

Please checkout the documentation below for more information on SQLite plugin and how to use it in your project:

[NativeScript SQLite Plugin](https://github.com/nathanaela/nativescript-sqlite)

As we can see above that the beacon monitoring is pretty straight-forward, however estimote beacon ranging will be paused if the app is not running in the foreground. In the `Info.Plist` file under `App_Resources` folder we need to include the following  lines:

    <key>NSLocationAlwaysUsageDescription</key>
    <string>Allow the app to access your location even when you not are using the App</string>
    <key>NSLocationUsageDescription</key>
    <string>Allow the app to access your current locaiton</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Allow the app to access your location when you are using the App</string>
    <key>UIBackgroundModes</key>

    <array>
    	<string>fetch</string>
    	<string>location</string>
    </array>


This will do the following :

1. Enable the background location tracking
2. Enable Background sync.

In order to keep the location running in background, you also need to initialize the location during app start and you can do it by overriding the applicationDidFinishLaunchingWithOptions method in the following way:


    AppDelegate.prototype.applicationDidFinishLaunchingWithOptions = function(application, options) {

        this.locationManagerDelegate = CLLocationManagerDelegateImpl.new().init();
        this.locationManager = CLLocationManager.alloc().init();
        this.locationManager.delegate = this.locationManagerDelegate;
        this.locationManager.distanceFilter = 100;
        this.locationManager.allowsBackgroundLocationUpdates = true;

        this.locationManager.requestAlwaysAuthorization();

        return true;
    };


Here I’ve initialized the distance filter to 100 meters but it should be adjusted based on your need or how frequently you want to track location changes. I’ve also assigned it a delegate to track the location changes and do something meaningful with it:

    var CLLocationManagerDelegateImpl = (function (_super) {
        __extends(CLLocationManagerDelegateImpl, _super);
        function CLLocationManagerDelegateImpl() {
            _super.apply(this, arguments);
        }
        CLLocationManagerDelegateImpl.new = function () {
            return _super.new.call(this);
        };

        CLLocationManagerDelegateImpl.prototype.locationManagerDidUpdateLocations = function(manager, locations) {
            //console.log("location updated")
        };

        CLLocationManagerDelegateImpl.prototype.locationManagerDidChangeAuthorizationStatus = function(manager, status) {
            manager.startUpdatingLocation();
        };

        CLLocationManagerDelegateImpl.ObjCProtocols = [CLLocationManagerDelegate];

        return CLLocationManagerDelegateImpl;
    })(NSObject);


It basically forces the location manager to run in background by requiring the user to accept the following dialog:


![Allow Background Location](images/estimote/screenshot.png)


This is required for continuous background processing as outlined in the estimote documentation:

If you're sure you need persistent background ranging for beacons, you'll need to activate the Background Modes capability for your application—specifically, the Location Updates mode.
Note that for startRangingBeaconsInRegion to work in the background you'll also need to start Standard Location Updates via CLLocationManager's startUpdatingLocation (meaning you need both a CLLocationManager and an ESTBeaconManager in your app).
Note: In iOS 9, you also need to set the allowsBackgroundLocationUpdates property of yourCLLocationManager to true.
Note: Even with background location updates running, iOS can still suspend the app if it doesn't detect any changes in the location. (Quote from Apple: "Enabling this mode does not prevent the system from suspending the app, but it does tell the system that it should wake up the app whenever there is new location data to deliver.")

[Estimote Background Monitoring]( http://developer.estimote.com/ibeacon/tutorial/part-2-background-monitoring/)

Finally, we need to sync the data back to the tracking portal from device storage which is just a tiny node app that uses socket.io to look for beacon changes. Inside the application delegate method I’ve added the applicationPerformFetchWIthCompletionHandler method with the following block:

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
                      //  console.log(JSON.stringify(result));
                   }, function (error){
                       console.error(JSON.stringify(error));
                   });
                }
              });
          });

         handler(UIBackgroundFetchResult.NewData);
    };

Full source code along with the tracker node app can be pulled from here:

[Github Repo](https://github.com/mehfuzh/estimote-monitor)

For more information on estimote beacons please checkout the following:

[Estimote Developer Portal](http://developer.estimote.com)

NativeScript getting started guide:

[NativeScript Getting Started](http://docs.nativescript.org/start/getting-started)
