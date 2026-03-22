# APNs Setup for Live Activity Push Notifications

This guide covers configuring Apple Push Notification service (APNs) credentials
so the backend can send push notifications to update Live Activities when the
app is in the background.

## Prerequisites

- An Apple Developer account (individual or organization)
- The Xcode project configured with the `com.focustodo.app` bundle identifier
- The "Push Notifications" capability enabled in the Xcode project

## Step 1: Create an APNs Authentication Key

1. Go to [Apple Developer > Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click the "+" button to create a new key
3. Enter a name (e.g., "Doable APNs Key")
4. Check "Apple Push Notifications service (APNs)"
5. Click "Continue", then "Register"
6. Download the `.p8` file (you can only download it once)
7. Note the **Key ID** shown on the confirmation page
8. Note your **Team ID** from the top-right of the Developer portal (or from
   Membership Details)

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# APNs Key ID from the Apple Developer portal
APNS_KEY_ID=ABC123DEFG

# Your Apple Developer Team ID
APNS_TEAM_ID=XYZ789TEAM

# The .p8 key file contents, base64-encoded.
# Generate with: base64 -i AuthKey_ABC123DEFG.p8 | tr -d '\n'
APNS_AUTH_KEY_P8=LS0tLS1CRUdJTi...base64-encoded-key...

# Set to "false" for production APNs server; defaults to sandbox
# APNS_SANDBOX=false
```

To base64-encode your `.p8` key file:

```bash
base64 -i AuthKey_ABC123DEFG.p8 | tr -d '\n'
```

## Step 3: Enable Push Notifications in Xcode

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the "App" target
3. Go to "Signing & Capabilities"
4. Click "+ Capability" and add "Push Notifications"
5. Ensure the capability is present for both Debug and Release configurations

## How It Works

The Live Activity timer display uses iOS's built-in `Text(timerInterval:countsDown:)`
which automatically updates every second without needing APNs. APNs is used for
two specific scenarios:

1. **Ending the Live Activity remotely**: When the timer is stopped from the web
   app while the iOS app is in the background, an APNs push with `event: "end"`
   dismisses the Live Activity from the Dynamic Island and Lock Screen.

2. **State updates**: If the timer state changes (e.g., paused/resumed), an APNs
   push with `event: "update"` syncs the content state.

## API Endpoint

`POST /api/live-activity-push`

Request body:
```json
{
  "pushToken": "hex-encoded-device-push-token",
  "isRunning": false
}
```

The push token is provided by ActivityKit when a Live Activity is started and is
automatically captured by the Capacitor LiveActivity plugin.

## Testing with iOS Simulator

The iOS Simulator supports Live Activities but does **not** support push
notifications. To test APNs:

1. Use a physical iOS device with a development provisioning profile
2. Or use the `xcrun simctl push` command to simulate pushes to the Simulator:

```bash
xcrun simctl push booted com.focustodo.app payload.json
```

Where `payload.json` contains:
```json
{
  "aps": {
    "timestamp": 1711234567,
    "event": "end",
    "content-state": {
      "isRunning": false
    }
  }
}
```

## Troubleshooting

- **"APNs credentials not configured"**: Ensure all three environment variables
  (`APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_AUTH_KEY_P8`) are set.
- **HTTP 403 from APNs**: The key may have been revoked, or the Team ID is
  incorrect. Regenerate the key.
- **HTTP 400 "BadDeviceToken"**: The push token has expired (Live Activity was
  ended). Start a new Live Activity to get a fresh token.
- **Sandbox vs. Production**: Development builds use the sandbox APNs server
  (`api.sandbox.push.apple.com`). Set `APNS_SANDBOX=false` for production.
