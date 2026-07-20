import Foundation

struct WidgetNutritionData: Codable {
    var calories: Int
    var calorieGoal: Int
    var protein: Int
    var proteinGoal: Int
    var water: Int
    var waterGoal: Int
    var activityProgress: Int
    var activityLabel: String
    var activityValue: String

    static let placeholder = WidgetNutritionData(
        calories: 0,
        calorieGoal: 2000,
        protein: 0,
        proteinGoal: 100,
        water: 0,
        waterGoal: 2000,
        activityProgress: 0,
        activityLabel: "Adım",
        activityValue: "0"
    )

    var caloriesLeft: Int {
        max(calorieGoal - calories, 0)
    }

    var calorieProgress: Double {
        guard calorieGoal > 0 else { return 0 }
        return min(Double(calories) / Double(calorieGoal), 1)
    }

    var waterProgress: Double {
        guard waterGoal > 0 else { return 0 }
        return min(Double(water) / Double(waterGoal), 1)
    }

    /// activityProgress App Group'ta 0–100 olarak saklanır.
    var activityProgressRatio: Double {
        min(max(Double(activityProgress) / 100.0, 0), 1)
    }
}

enum WidgetDataStore {
    static let appGroup = "group.com.omerexpo.badoo"
    static let nutritionKey = "badooNutritionSummary"

    static func loadNutrition() -> WidgetNutritionData? {
        guard let defaults = UserDefaults(suiteName: appGroup),
              let data = defaults.data(forKey: nutritionKey) else {
            return nil
        }

        return try? JSONDecoder().decode(WidgetNutritionData.self, from: data)
    }
}

enum WidgetLinks {
    static let mealPhoto = URL(string: "badoo://widget/meal-photo")!
    static let food = URL(string: "badoo://add/food")!
    static let water = URL(string: "badoo://add/water")!
    static let activity = URL(string: "badoo://add/activity")!
}
