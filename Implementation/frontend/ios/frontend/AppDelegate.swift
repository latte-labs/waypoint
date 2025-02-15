import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase  // ✅ Import Firebase

@main
class AppDelegate: RCTAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {
    self.moduleName = "frontend"
    self.dependencyProvider = RCTAppDependencyProvider()

    // ✅ Initialize Firebase
    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
      print("✅ Firebase initialized successfully")
    }

    // You can add your custom initial props in the dictionary below.
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
