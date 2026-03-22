import XCTest
// Source files are compiled directly into the test target (widget extensions
// cannot use @testable import). DoableActivityAttributes.swift and
// DoableLiveActivityWidget.swift are included in this target's Sources phase.

final class DoableLiveActivityTests: XCTestCase {

    // MARK: - DoableActivityAttributes Tests

    func testActivityAttributesStoresTaskName() {
        let attrs = DoableActivityAttributes(
            taskName: "Write quarterly report",
            startTimestamp: Date()
        )
        XCTAssertEqual(attrs.taskName, "Write quarterly report")
    }

    func testActivityAttributesStoresStartTimestamp() {
        let date = Date(timeIntervalSince1970: 1_700_000_000)
        let attrs = DoableActivityAttributes(
            taskName: "Test task",
            startTimestamp: date
        )
        XCTAssertEqual(attrs.startTimestamp, date)
    }

    func testContentStateIsRunning() {
        let running = DoableActivityAttributes.ContentState(isRunning: true)
        XCTAssertTrue(running.isRunning)

        let stopped = DoableActivityAttributes.ContentState(isRunning: false)
        XCTAssertFalse(stopped.isRunning)
    }

    func testContentStateCodable() throws {
        let state = DoableActivityAttributes.ContentState(isRunning: true)
        let data = try JSONEncoder().encode(state)
        let decoded = try JSONDecoder().decode(
            DoableActivityAttributes.ContentState.self,
            from: data
        )
        XCTAssertEqual(state, decoded)
    }

    func testContentStateCodableRoundTrip() throws {
        let state = DoableActivityAttributes.ContentState(isRunning: false)
        let data = try JSONEncoder().encode(state)
        let json = String(data: data, encoding: .utf8)!
        XCTAssertTrue(json.contains("\"isRunning\":false") || json.contains("\"isRunning\" : false"))
        let decoded = try JSONDecoder().decode(
            DoableActivityAttributes.ContentState.self,
            from: data
        )
        XCTAssertEqual(state, decoded)
    }

    func testContentStateHashable() {
        let state1 = DoableActivityAttributes.ContentState(isRunning: true)
        let state2 = DoableActivityAttributes.ContentState(isRunning: true)
        let state3 = DoableActivityAttributes.ContentState(isRunning: false)

        XCTAssertEqual(state1, state2)
        XCTAssertNotEqual(state1, state3)

        // Verify they work in a Set
        let set: Set = [state1, state2, state3]
        XCTAssertEqual(set.count, 2)
    }

    // MARK: - formatElapsedTime Tests

    func testFormatElapsedTimeZero() {
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(0), "00:00")
    }

    func testFormatElapsedTimeSeconds() {
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(5), "00:05")
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(59), "00:59")
    }

    func testFormatElapsedTimeMinutes() {
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(60), "01:00")
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(754), "12:34")
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(3599), "59:59")
    }

    func testFormatElapsedTimeHours() {
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(3600), "1:00:00")
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(3661), "1:01:01")
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(36000), "10:00:00")
    }

    func testFormatElapsedTimeLargeValues() {
        // 99 hours, 59 minutes, 59 seconds
        XCTAssertEqual(DoableLiveActivityWidget.formatElapsedTime(359999), "99:59:59")
    }
}
