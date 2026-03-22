#if DEBUG
import ActivityKit
import SwiftUI

/// Mirror of DoableActivityAttributes from the extension target.
/// Must match exactly so ActivityKit routes the activity to the widget.
/// The canonical definition lives in DoableLiveActivity/DoableActivityAttributes.swift.
@available(iOS 16.2, *)
struct DoableActivityAttributes: ActivityAttributes {
    var taskName: String
    var startTimestamp: Date

    struct ContentState: Codable, Hashable {
        var isRunning: Bool
    }
}

/// Debug-only screen that starts a real Live Activity and renders previews.
/// Launch with --preview-live-activity argument to see this screen.
@available(iOS 16.2, *)
struct LiveActivityPreviewScreen: View {
    @State private var activityStarted = false
    @State private var errorMessage: String?
    private let taskName = "Write quarterly report"
    private let startTimestamp = Date()

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Text("Live Activity Preview")
                    .font(.largeTitle)
                    .padding(.top, 40)

                if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding()
                }

                if activityStarted {
                    Text("Live Activity is running! Lock the screen (Cmd+L) to see it on the Lock Screen, or check the Dynamic Island.")
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(12)
                } else {
                    Button(action: startLiveActivity) {
                        Label("Start Live Activity", systemImage: "play.fill")
                            .font(.headline)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }

                // Compact Island
                VStack(alignment: .leading) {
                    Text("Dynamic Island - Compact")
                        .font(.caption)
                        .foregroundColor(.secondary)
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

                // Expanded Island
                VStack(alignment: .leading) {
                    Text("Dynamic Island - Expanded")
                        .font(.caption)
                        .foregroundColor(.secondary)
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

                // Lock Screen
                VStack(alignment: .leading) {
                    Text("Lock Screen Widget")
                        .font(.caption)
                        .foregroundColor(.secondary)
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
            .padding(.horizontal)
        }
        .onAppear {
            startLiveActivity()
        }
    }

    private func startLiveActivity() {
        guard !activityStarted else { return }

        let attributes = DoableActivityAttributes(
            taskName: taskName,
            startTimestamp: startTimestamp
        )
        let contentState = DoableActivityAttributes.ContentState(isRunning: true)

        do {
            let _ = try Activity<DoableActivityAttributes>.request(
                attributes: attributes,
                content: .init(state: contentState, staleDate: nil),
                pushType: nil
            )
            activityStarted = true
        } catch {
            errorMessage = "Failed to start Live Activity: \(error.localizedDescription)"
        }
    }
}
#endif
