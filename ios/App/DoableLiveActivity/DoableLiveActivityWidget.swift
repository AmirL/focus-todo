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
