import WidgetKit
import SwiftUI

struct QuickActionItem: View {
    let icon: String
    let title: String
    let subtitle: String
    let url: URL

    var body: some View {
        Link(destination: url) {
            VStack(spacing: 6) {
                ZStack(alignment: .bottomTrailing) {
                    Circle()
                        .fill(Color.white.opacity(0.14))
                        .frame(width: 46, height: 46)

                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 46, height: 46)

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

struct QuickActionsWidgetView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Hızlı ekle")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.92))
                Spacer()
                Text("Badoo")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.55))
            }

            HStack(spacing: 8) {
                QuickActionItem(
                    icon: "camera.fill",
                    title: "Öğünü Çek",
                    subtitle: "Fotoğraf",
                    url: WidgetLinks.mealPhoto
                )
                QuickActionItem(
                    icon: "fork.knife",
                    title: "Öğün Ekle",
                    subtitle: "Liste",
                    url: WidgetLinks.food
                )
                QuickActionItem(
                    icon: "drop.fill",
                    title: "Su Ekle",
                    subtitle: "Takip",
                    url: WidgetLinks.water
                )
                QuickActionItem(
                    icon: "figure.walk",
                    title: "Aktivite",
                    subtitle: "Kayıt",
                    url: WidgetLinks.activity
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

struct QuickActionsEntry: TimelineEntry {
    let date: Date
}

struct QuickActionsProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuickActionsEntry {
        QuickActionsEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (QuickActionsEntry) -> Void) {
        completion(QuickActionsEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuickActionsEntry>) -> Void) {
        let entry = QuickActionsEntry(date: Date())
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(60 * 60 * 6)))
        completion(timeline)
    }
}

struct QuickActionsWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family

    var body: some View {
        switch family {
        case .accessoryRectangular:
            HStack(spacing: 10) {
                Link(destination: WidgetLinks.mealPhoto) {
                    Image(systemName: "camera.fill")
                }
                Link(destination: WidgetLinks.food) {
                    Image(systemName: "fork.knife")
                }
                Link(destination: WidgetLinks.water) {
                    Image(systemName: "drop.fill")
                }
                Link(destination: WidgetLinks.activity) {
                    Image(systemName: "figure.walk")
                }
            }
            .font(.caption)
        default:
            QuickActionsWidgetView()
        }
    }
}

struct BadooQuickActionsWidget: Widget {
    let kind = "BadooQuickActions"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuickActionsProvider()) { _ in
            QuickActionsWidgetEntryView()
                .containerBackground(for: .widget) {
                    Color(red: 0.10, green: 0.10, blue: 0.12)
                }
        }
        .configurationDisplayName("Badoo Hızlı Ekle")
        .description("Öğün, su ve aktivite kayıtlarını hızlıca ekle.")
        .supportedFamilies([.systemMedium, .accessoryRectangular])
    }
}
