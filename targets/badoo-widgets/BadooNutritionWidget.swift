import WidgetKit
import SwiftUI

struct NutritionWidgetView: View {
    let data: WidgetNutritionData

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color(red: 1.0, green: 0.48, blue: 0.0))

                Text("\(data.caloriesLeft)")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(Color(red: 0.55, green: 0.78, blue: 1.0))

                Text("kcal kaldı")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.85))
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.18))
                        .frame(height: 8)

                    Capsule()
                        .fill(Color(red: 0.55, green: 0.78, blue: 1.0))
                        .frame(width: max(8, geometry.size.width * data.calorieProgress), height: 8)
                }
            }
            .frame(height: 8)

            HStack(spacing: 12) {
                NutritionMiniStat(icon: "bolt.fill", value: "\(data.protein)g", label: "Protein")
                NutritionMiniStat(icon: "leaf.fill", value: "\(max(data.waterGoal - data.water, 0))ml", label: "Su kaldı")
                NutritionMiniStat(icon: "figure.walk", value: data.activityValue, label: data.activityLabel)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.12, green: 0.34, blue: 0.78),
                    Color(red: 0.18, green: 0.48, blue: 0.92),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

struct NutritionMiniStat: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(.white.opacity(0.85))
            VStack(alignment: .leading, spacing: 0) {
                Text(value)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                Text(label)
                    .font(.system(size: 8))
                    .foregroundStyle(.white.opacity(0.65))
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct NutritionEntry: TimelineEntry {
    let date: Date
    let data: WidgetNutritionData
}

struct NutritionProvider: TimelineProvider {
    func placeholder(in context: Context) -> NutritionEntry {
        NutritionEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (NutritionEntry) -> Void) {
        let data = WidgetDataStore.loadNutrition() ?? .placeholder
        completion(NutritionEntry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NutritionEntry>) -> Void) {
        let data = WidgetDataStore.loadNutrition() ?? .placeholder
        let entry = NutritionEntry(date: Date(), data: data)
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60)))
        completion(timeline)
    }
}

struct NutritionWidgetEntryView: View {
    let data: WidgetNutritionData

    @Environment(\.widgetFamily) private var family

    var body: some View {
        switch family {
        case .accessoryRectangular:
            BadooNutritionRectangularView(data: data)
        default:
            NutritionWidgetView(data: data)
        }
    }
}

struct BadooNutritionWidget: Widget {
    let kind = "BadooNutrition"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NutritionProvider()) { entry in
            NutritionWidgetEntryView(data: entry.data)
                .containerBackground(for: .widget) {
                    Color(red: 0.12, green: 0.34, blue: 0.78)
                }
        }
        .configurationDisplayName("Badoo Günlük Özet")
        .description("Kalori, protein, su ve aktivite ilerlemeni gösterir.")
        .supportedFamilies([.systemMedium, .accessoryRectangular])
    }
}

struct BadooNutritionRectangularView: View {
    let data: WidgetNutritionData

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Color(red: 1.0, green: 0.48, blue: 0.0))

                Text("\(data.caloriesLeft)")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(Color(red: 0.55, green: 0.78, blue: 1.0))

                Text("kcal kaldı")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(.white.opacity(0.85))
            }

            HStack(spacing: 8) {
                Text("\(data.protein)g protein")
                Text("\(data.water)ml su")
                Spacer(minLength: 0)
                Text(data.activityValue)
                    .lineLimit(1)
            }
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(.white.opacity(0.8))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}
