#if DEBUG
import SwiftUI

/// Debug-only screen that renders the Live Activity views for screenshot capture.
/// Launch with --preview-live-activity argument to see this screen.
@available(iOS 16.1, *)
struct LiveActivityPreviewScreen: View {
    private let taskName = "Write quarterly report"
    private let startTimestamp = Date().addingTimeInterval(-754) // ~12:34 ago

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Text("Live Activity Preview")
                    .font(.largeTitle)
                    .padding(.top, 40)

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
    }
}
#endif
