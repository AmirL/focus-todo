import ActivityKit
import Foundation

struct DoableActivityAttributes: ActivityAttributes {
    /// The name of the task being tracked
    var taskName: String

    /// When the timer was started
    var startTimestamp: Date

    /// Dynamic state updated during the Live Activity lifecycle.
    /// Note: The timer display uses Text(timerInterval:countsDown:) which iOS
    /// updates automatically. ContentState is used for bridge-driven updates
    /// (e.g., pausing/stopping the activity from the JS layer).
    struct ContentState: Codable, Hashable {
        /// Whether the timer is currently running
        var isRunning: Bool
    }
}
