import Foundation
import Capacitor
import ActivityKit

@available(iOS 16.2, *)
@objc(LiveActivityPlugin)
class LiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "LiveActivityPlugin"
    let jsName = "LiveActivity"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise),
    ]

    /// Starts a new Live Activity with the given task name.
    /// Call from JS: LiveActivity.start({ taskName: "My Task" })
    @objc func start(_ call: CAPPluginCall) {
        guard let taskName = call.getString("taskName") else {
            call.reject("taskName is required")
            return
        }

        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.reject("Live Activities are not enabled on this device")
            return
        }

        let attributes = DoableActivityAttributes(
            taskName: taskName,
            startTimestamp: Date()
        )
        let contentState = DoableActivityAttributes.ContentState(isRunning: true)

        do {
            let activity = try Activity<DoableActivityAttributes>.request(
                attributes: attributes,
                content: .init(state: contentState, staleDate: nil),
                pushType: .token
            )

            // Observe push token and log it for APNs integration
            Task {
                for await tokenData in activity.pushTokenUpdates {
                    let token = tokenData.map { String(format: "%02x", $0) }.joined()
                    print("[LiveActivity] Push token: \(token)")
                    // Notify JS layer about the push token
                    self.notifyListeners("pushTokenReceived", data: [
                        "token": token,
                        "activityId": activity.id
                    ])
                }
            }

            call.resolve([
                "activityId": activity.id
            ])
        } catch {
            call.reject("Failed to start Live Activity: \(error.localizedDescription)")
        }
    }

    /// Updates the running Live Activity's content state.
    /// Call from JS: LiveActivity.update({ isRunning: true })
    @objc func update(_ call: CAPPluginCall) {
        guard let isRunning = call.getBool("isRunning") else {
            call.reject("isRunning is required")
            return
        }

        let contentState = DoableActivityAttributes.ContentState(isRunning: isRunning)

        Task {
            for activity in Activity<DoableActivityAttributes>.activities {
                await activity.update(
                    ActivityContent(state: contentState, staleDate: nil)
                )
            }
            call.resolve()
        }
    }

    /// Ends all running Live Activities.
    /// Call from JS: LiveActivity.end()
    @objc func end(_ call: CAPPluginCall) {
        let contentState = DoableActivityAttributes.ContentState(isRunning: false)

        Task {
            for activity in Activity<DoableActivityAttributes>.activities {
                await activity.end(
                    ActivityContent(state: contentState, staleDate: nil),
                    dismissalPolicy: .immediate
                )
            }
            call.resolve()
        }
    }
}
