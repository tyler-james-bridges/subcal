import WidgetKit
import SwiftUI

struct SubscriptionEntry: TimelineEntry {
    let date: Date
    let subscriptions: [WidgetSubscription]
    let monthlyTotal: Double
}

struct WidgetSubscription: Identifiable {
    let id: String
    let name: String
    let price: Double
    let billingDay: Int
    let icon: String
    let isMonthly: Bool
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SubscriptionEntry {
        SubscriptionEntry(
            date: Date(),
            subscriptions: [
                WidgetSubscription(id: "1", name: "Netflix", price: 15.99, billingDay: 3, icon: "netflix", isMonthly: true),
                WidgetSubscription(id: "2", name: "Spotify", price: 9.99, billingDay: 10, icon: "spotify", isMonthly: true)
            ],
            monthlyTotal: 158.59
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SubscriptionEntry) -> ()) {
        let entry = placeholder(in: context)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SubscriptionEntry>) -> ()) {
        // Load data from shared UserDefaults (App Group)
        let sharedDefaults = UserDefaults(suiteName: "group.com.subcal.app")

        var subscriptions: [WidgetSubscription] = []
        var monthlyTotal: Double = 0

        if let data = sharedDefaults?.data(forKey: "widgetSubscriptions"),
           let decoded = try? JSONDecoder().decode([WidgetSubscriptionData].self, from: data) {
            subscriptions = decoded.map { item in
                WidgetSubscription(
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    billingDay: item.billingDay,
                    icon: item.icon,
                    isMonthly: item.billingCycle == "monthly"
                )
            }
        }

        monthlyTotal = sharedDefaults?.double(forKey: "monthlyTotal") ?? 0

        // If no data, use placeholder
        if subscriptions.isEmpty {
            subscriptions = placeholder(in: context).subscriptions
            monthlyTotal = placeholder(in: context).monthlyTotal
        }

        let entry = SubscriptionEntry(
            date: Date(),
            subscriptions: Array(subscriptions.prefix(5)),
            monthlyTotal: monthlyTotal
        )

        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct WidgetSubscriptionData: Codable {
    let id: String
    let name: String
    let price: Double
    let billingDay: Int
    let icon: String
    let billingCycle: String
}

struct SubCalWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    let entry: SubscriptionEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("SubCal")
                    .font(.headline)
                    .fontWeight(.bold)
                Spacer()
                Image(systemName: "calendar")
                    .foregroundColor(.orange)
            }

            Spacer()

            Text("Monthly")
                .font(.caption)
                .foregroundColor(.secondary)

            Text("$\(entry.monthlyTotal, specifier: "%.2f")")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.orange)

            Text("\(entry.subscriptions.count) upcoming")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct MediumWidgetView: View {
    let entry: SubscriptionEntry

    var upcomingSubscriptions: [WidgetSubscription] {
        let calendar = Calendar.current
        let today = calendar.component(.day, from: Date())

        return entry.subscriptions
            .filter { $0.billingDay >= today }
            .sorted { $0.billingDay < $1.billingDay }
    }

    var body: some View {
        HStack(spacing: 16) {
            // Left side - total
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("SubCal")
                        .font(.headline)
                        .fontWeight(.bold)
                    Image(systemName: "calendar")
                        .foregroundColor(.orange)
                }

                Spacer()

                Text("Monthly")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("$\(entry.monthlyTotal, specifier: "%.2f")")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Divider()

            // Right side - upcoming
            VStack(alignment: .leading, spacing: 6) {
                Text("Upcoming")
                    .font(.caption)
                    .foregroundColor(.secondary)

                ForEach(Array(upcomingSubscriptions.prefix(3))) { sub in
                    HStack {
                        Circle()
                            .fill(sub.isMonthly ? Color.purple : Color.orange)
                            .frame(width: 6, height: 6)

                        Text(sub.name)
                            .font(.caption)
                            .lineLimit(1)

                        Spacer()

                        Text("\(sub.billingDay)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                if upcomingSubscriptions.isEmpty {
                    Text("No upcoming")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

@main
struct SubCalWidget: Widget {
    let kind: String = "SubCalWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            SubCalWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("SubCal")
        .description("Track your subscription spending")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    SubCalWidget()
} timeline: {
    SubscriptionEntry(
        date: Date(),
        subscriptions: [
            WidgetSubscription(id: "1", name: "Netflix", price: 15.99, billingDay: 3, icon: "netflix", isMonthly: true)
        ],
        monthlyTotal: 158.59
    )
}
