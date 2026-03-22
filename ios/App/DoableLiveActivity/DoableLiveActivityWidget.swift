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
                    elapsedTimeLabel(context.state.elapsedTime)
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
                Image(systemName: "timer")
                    .foregroundColor(.accentColor)
            } compactTrailing: {
                elapsedTimeLabel(context.state.elapsedTime)
                    .font(.caption.monospacedDigit())
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

            elapsedTimeLabel(context.state.elapsedTime)
                .font(.title.monospacedDigit())
                .foregroundColor(.accentColor)
        }
        .padding()
    }

    // MARK: - Helpers

    private func elapsedTimeLabel(_ elapsed: TimeInterval) -> Text {
        let hours = Int(elapsed) / 3600
        let minutes = (Int(elapsed) % 3600) / 60
        let seconds = Int(elapsed) % 60

        if hours > 0 {
            return Text(String(format: "%d:%02d:%02d", hours, minutes, seconds))
        } else {
            return Text(String(format: "%02d:%02d", minutes, seconds))
        }
    }
}
