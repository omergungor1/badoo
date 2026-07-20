import WidgetKit
import SwiftUI

private enum ProgressRingPalette {
    static let calorie = Color(red: 1.0, green: 0.48, blue: 0.0)
    static let water = Color(red: 0.29, green: 0.66, blue: 1.0)
    static let activity = Color(red: 0.13, green: 0.77, blue: 0.37)
    static let track = Color.white.opacity(0.18)
}

struct ProgressQuickActionItem: View {
    let icon: String
    let title: String
    let subtitle: String
    let url: URL
    let progress: Double?
    let ringColor: Color

    private let outerSize: CGFloat = 46
    private let innerSize: CGFloat = 36
    private let ringWidth: CGFloat = 3

    var body: some View {
        Link(destination: url) {
            VStack(spacing: 6) {
                ZStack(alignment: .bottomTrailing) {
                    ZStack {
                        if let progress {
                            Circle()
                                .stroke(ProgressRingPalette.track, lineWidth: ringWidth)
                                .frame(width: outerSize, height: outerSize)

                            Circle()
                                .trim(from: 0, to: max(0, min(progress, 1)))
                                .stroke(
                                    ringColor,
                                    style: StrokeStyle(lineWidth: ringWidth, lineCap: .round)
                                )
                                .rotationEffect(.degrees(-90))
                                .frame(width: outerSize, height: outerSize)
                        }

                        Circle()
                            .fill(Color.white.opacity(0.14))
                            .frame(width: progress == nil ? outerSize : innerSize,
                                   height: progress == nil ? outerSize : innerSize)

                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    .frame(width: outerSize, height: outerSize)

                    Circle()
                        .fill(Color(red: 0.18, green: 0.55, blue: 1.0))
                        .frame(width: 16, height: 16)
                        .overlay {
                            Image(systemName: "plus")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(.white)
                        }
                        .offset(x: 2, y: 2)
                }

                Text(title)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineLimit(1)

                Text(subtitle)
                    .font(.system(size: 9))
                    .foregroundStyle(.white.opacity(0.65))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

struct QuickActionsProgressWidgetView: View {
    let data: WidgetNutritionData

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Hızlı hedef")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.92))
                Spacer()
                Text("Badoo")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.55))
            }

            HStack(spacing: 8) {
                ProgressQuickActionItem(
                    icon: "camera.fill",
                    title: "Öğünü Çek",
                    subtitle: "Fotoğraf",
                    url: WidgetLinks.mealPhoto,
                    progress: nil,
                    ringColor: ProgressRingPalette.calorie
                )
                ProgressQuickActionItem(
                    icon: "fork.knife",
                    title: "Öğün Ekle",
                    subtitle: "Liste",
                    url: WidgetLinks.food,
                    progress: data.calorieProgress,
                    ringColor: ProgressRingPalette.calorie
                )
                ProgressQuickActionItem(
                    icon: "drop.fill",
                    title: "Su Ekle",
                    subtitle: "Takip",
                    url: WidgetLinks.water,
                    progress: data.waterProgress,
                    ringColor: ProgressRingPalette.water
                )
                ProgressQuickActionItem(
                    icon: "figure.walk",
                    title: "Aktivite",
                    subtitle: "Kayıt",
                    url: WidgetLinks.activity,
                    progress: data.activityProgressRatio,
                    ringColor: ProgressRingPalette.activity
                )
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.10, green: 0.10, blue: 0.12),
                    Color(red: 0.16, green: 0.16, blue: 0.20),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

struct QuickActionsProgressLockView: View {
    let data: WidgetNutritionData

    var body: some View {
        HStack(spacing: 12) {
            lockIcon(destination: WidgetLinks.mealPhoto, icon: "camera.fill", progress: nil, color: ProgressRingPalette.calorie)
            lockIcon(destination: WidgetLinks.food, icon: "fork.knife", progress: data.calorieProgress, color: ProgressRingPalette.calorie)
            lockIcon(destination: WidgetLinks.water, icon: "drop.fill", progress: data.waterProgress, color: ProgressRingPalette.water)
            lockIcon(destination: WidgetLinks.activity, icon: "figure.walk", progress: data.activityProgressRatio, color: ProgressRingPalette.activity)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    @ViewBuilder
    private func lockIcon(destination: URL, icon: String, progress: Double?, color: Color) -> some View {
        Link(destination: destination) {
            ZStack {
                if let progress {
                    Circle()
                        .stroke(ProgressRingPalette.track, lineWidth: 2.5)
                        .frame(width: 28, height: 28)
                    Circle()
                        .trim(from: 0, to: max(0, min(progress, 1)))
                        .stroke(color, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .frame(width: 28, height: 28)
                }

                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

struct QuickActionsProgressEntry: TimelineEntry {
    let date: Date
    let data: WidgetNutritionData
}

struct QuickActionsProgressProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuickActionsProgressEntry {
        QuickActionsProgressEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (QuickActionsProgressEntry) -> Void) {
        let data = WidgetDataStore.loadNutrition() ?? .placeholder
        completion(QuickActionsProgressEntry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuickActionsProgressEntry>) -> Void) {
        let data = WidgetDataStore.loadNutrition() ?? .placeholder
        let entry = QuickActionsProgressEntry(date: Date(), data: data)
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60)))
        completion(timeline)
    }
}

struct QuickActionsProgressEntryView: View {
    let data: WidgetNutritionData

    @Environment(\.widgetFamily) private var family

    var body: some View {
        switch family {
        case .accessoryRectangular:
            QuickActionsProgressLockView(data: data)
        default:
            QuickActionsProgressWidgetView(data: data)
        }
    }
}

struct BadooQuickActionsProgressWidget: Widget {
    let kind = "BadooQuickProgress"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuickActionsProgressProvider()) { entry in
            QuickActionsProgressEntryView(data: entry.data)
                .containerBackground(for: .widget) {
                    Color(red: 0.10, green: 0.10, blue: 0.12)
                }
        }
        .configurationDisplayName("Badoo Hızlı Hedefler")
        .description("Öğün, su ve aktivite hedeflerine ulaşma yüzdesini gösterir.")
        .supportedFamilies([.systemMedium, .accessoryRectangular])
    }
}
