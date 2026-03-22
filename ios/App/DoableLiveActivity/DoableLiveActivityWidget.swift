import ActivityKit
import SwiftUI
import WidgetKit

struct DoableLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DoableActivityAttributes.self) { context in
            // Lock Screen / banner view
            lockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded view
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.attributes.taskName, systemImage: "timer")
                        .font(.headline)
                        .lineLimit(1)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    liveTimer(since: context.attributes.startTimestamp)
                        .font(.title2.monospacedDigit())
                        .foregroundColor(.accentColor)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Image(systemName: "clock")
                            .foregroundColor(.secondary)
                        Text("Started \(context.attributes.startTimestamp, style: .time)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            } compactLeading: {
                Text(context.attributes.taskName)
                    .font(.caption2)
                    .lineLimit(1)
                    .truncationMode(.tail)
            } compactTrailing: {
                liveTimer(since: context.attributes.startTimestamp)
                    .font(.caption.monospacedDigit())
                    .foregroundColor(.accentColor)
            } minimal: {
                Image(systemName: "timer")
                    .foregroundColor(.accentColor)
            }
        }
    }

    // MARK: - Lock Screen View

    @ViewBuilder
    private func lockScreenView(context: ActivityViewContext<DoableActivityAttributes>) -> some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(context.attributes.taskName)
                    .font(.headline)
                    .lineLimit(1)

                Text("Started \(context.attributes.startTimestamp, style: .time)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            liveTimer(since: context.attributes.startTimestamp)
                .font(.title.monospacedDigit())
                .foregroundColor(.accentColor)
        }
        .padding()
    }

    // MARK: - Helpers

    /// Returns a live-updating timer Text that counts up from the given start date.
    /// iOS updates this automatically every second without needing APNs pushes.
    private func liveTimer(since startDate: Date) -> Text {
        Text(timerInterval: startDate...Date.distantFuture, countsDown: false)
    }

    /// Formats elapsed seconds as HH:MM:SS or MM:SS for static display contexts.
    static func formatElapsedTime(_ elapsed: TimeInterval) -> String {
        let hours = Int(elapsed) / 3600
        let minutes = (Int(elapsed) % 3600) / 60
        let seconds = Int(elapsed) % 60

        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}

// MARK: - Standalone Preview Views

/// Renders the Lock Screen Live Activity view as a standalone SwiftUI view
/// for preview and screenshot purposes.
struct LockScreenPreview: View {
    let taskName: String
    let startTimestamp: Date

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(taskName)
                    .font(.headline)
                    .lineLimit(1)

                Text("Started \(startTimestamp, style: .time)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Text(timerInterval: startTimestamp...Date.distantFuture, countsDown: false)
                .font(.title.monospacedDigit())
                .foregroundColor(.accentColor)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(radius: 4)
    }
}

/// Renders the Dynamic Island expanded view as a standalone SwiftUI view
/// for preview and screenshot purposes.
struct ExpandedIslandPreview: View {
    let taskName: String
    let startTimestamp: Date

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Label(taskName, systemImage: "timer")
                    .font(.headline)
                    .lineLimit(1)
                Spacer()
                Text(timerInterval: startTimestamp...Date.distantFuture, countsDown: false)
                    .font(.title2.monospacedDigit())
                    .foregroundColor(.accentColor)
            }
            HStack {
                Image(systemName: "clock")
                    .foregroundColor(.secondary)
                Text("Started \(startTimestamp, style: .time)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
            }
        }
        .padding()
        .background(Color.black)
        .foregroundColor(.white)
        .cornerRadius(24)
    }
}

/// Renders the Dynamic Island compact view as a standalone SwiftUI view
/// for preview and screenshot purposes.
struct CompactIslandPreview: View {
    let taskName: String
    let startTimestamp: Date

    var body: some View {
        HStack {
            Text(taskName)
                .font(.caption2)
                .lineLimit(1)
                .truncationMode(.tail)
            Spacer()
            Text(timerInterval: startTimestamp...Date.distantFuture, countsDown: false)
                .font(.caption.monospacedDigit())
                .foregroundColor(.accentColor)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.black)
        .foregroundColor(.white)
        .cornerRadius(20)
    }
}

#Preview("Lock Screen") {
    LockScreenPreview(
        taskName: "Write quarterly report",
        startTimestamp: Date().addingTimeInterval(-754)
    )
    .padding()
}

#Preview("Expanded Island") {
    ExpandedIslandPreview(
        taskName: "Write quarterly report",
        startTimestamp: Date().addingTimeInterval(-754)
    )
    .padding()
}

#Preview("Compact Island") {
    CompactIslandPreview(
        taskName: "Write quarterly report",
        startTimestamp: Date().addingTimeInterval(-754)
    )
    .padding()
}
