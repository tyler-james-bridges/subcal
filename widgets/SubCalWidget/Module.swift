import ExpoModulesCore
import WidgetKit

public class SubCalWidgetModule: Module {
    public func definition() -> ModuleDefinition {
        Name("SubCalWidget")

        Function("reloadAllTimelines") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }

        Function("setWidgetData") { (data: String, key: String) in
            let sharedDefaults = UserDefaults(suiteName: "group.com.subcal.app")
            sharedDefaults?.set(data, forKey: key)
            sharedDefaults?.synchronize()
        }

        Function("getWidgetData") { (key: String) -> String? in
            let sharedDefaults = UserDefaults(suiteName: "group.com.subcal.app")
            return sharedDefaults?.string(forKey: key)
        }
    }
}
