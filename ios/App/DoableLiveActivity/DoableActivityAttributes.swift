import ActivityKit
import Foundation

struct DoableActivityAttributes: ActivityAttributes {
    /// The name of the task being tracked
    var taskName: String

    /// When the timer was started
    var startTimestamp: Date

    /// Dynamic state updated during the Live Activity lifecycle
    struct ContentState: Codable, Hashable {
        /// Cumulative elapsed time in seconds
        var elapsedTime: TimeInterval
    }
}
