var application = require("application");
var Sqlite = require( "nativescript-sqlite" );

application.mainModule = "main-page";
application.cssFile = "./app.css";

// Open your app's main js file and add this handler (delimited by 'START 3DTouch wiring' and 'END 3DTouch wiring').
// Then tweak the handling of 'shortcutItem.type' to your liking (here I'm deeplinking 'compose' to the 'compose' page and ignore other shortcut types).

var application = require("application");
application.cssFile = "./app.css";
application.mainModule = "main-page";

var AppDelegate = (function (_super) {
    __extends(AppDelegate, _super);
    function AppDelegate() {
        _super.apply(this, arguments);
    }

    AppDelegate.prototype.applicationDidFinishLaunchingWithOptions = function(application, options) {
        return true;
    };

    AppDelegate.prototype.applicationPerformFetchWithCompletionHandler = function(application, handler){
         console.log(handler);
         console.log(UIBackgroundFetchResult.NewData);
         handler(UIBackgroundFetchResult.NewData);
    };

    AppDelegate.ObjCProtocols = [UIApplicationDelegate];
    return AppDelegate;
})(UIResponder);
application.ios.delegate = AppDelegate;
// END 3DTouch wiring


application.start();
