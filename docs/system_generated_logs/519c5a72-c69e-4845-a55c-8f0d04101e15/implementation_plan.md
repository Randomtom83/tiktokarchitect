# Implementation Plan: Reconciled Code Audit Fixes for v1.4.3 (build 11)

This plan implements the six verified code/UX defects identified in the recent fresh-eyes audit.

## User Review Required

> [!NOTE]
> All changes are minor UX and stability improvements and adhere to the strict privacy and pedagogical constraints of the app. The next release will be versioned as **v1.4.3 (build 11)**.

## Open Questions

None.

## Proposed Changes

### 1. Robust TTS Initialization and Fallback

#### [MODIFY] [NarrationManager.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/audio/NarrationManager.kt)
- Keep track of an `initFailed` boolean flag.
- If TTS fails to initialize (`status != TextToSpeech.SUCCESS`) or if `Locale.US` is not supported, set `initFailed = true` and show a Toast warning: *"Text-to-Speech failed to start. Please check your system US-English voice settings!"*.
- When `speakText` is called, check if `initFailed` is true. If so, attempt to re-initialize TTS, providing an automatic retry mechanism if the TTS engine becomes available later.

---

### 2. Navigation Back-Press Crash Guard

#### [MODIFY] [Navigation.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/Navigation.kt)
- Guard the system back-press event for `Home` to only pop the backstack if it contains more than just the home screen:
  ```kotlin
  onBack = { if (backStack.size > 1) backStack.removeLastOrNull() }
  ```

---

### 3. Drag-During-Reset Sandbox Guard

#### [MODIFY] [SandboxScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/ui/sandbox/SandboxScreen.kt)
- Guard the pointer input drag loop so that dragging is ignored and aborted when the reset tween is actively running:
  - In `onDrag`: return early if `resetting` is true.
  - In `release(b)` helper: if `resetting` is true, clean up grab state and return early instead of settling into a new orbit.

---

### 4. Dynamic SoundPool Re-Ducking

#### [MODIFY] [SoundSynth.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/audio/SoundSynth.kt)
- Add a thread-safe `activeStreams` set (`ConcurrentHashMap.newKeySet<Int>()`).
- When a sound is played, add its `streamId` to `activeStreams` and launch a coroutine to remove it after a 3-second delay (plenty of time for chimes/fanfare to complete).
- Implement a custom setter for `volumeScale` that iterates over `activeStreams` and calls `pool.setVolume(streamId, value, value)` to retroactively duck already playing sounds.

---

### 5. Stale Sensor Accuracy Cleanup

#### [MODIFY] [OrientationProvider.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/sky/OrientationProvider.kt)
- In the `stop()` method, reset the accuracy flow back to `SensorManager.SENSOR_STATUS_ACCURACY_HIGH` to prevent starting the next session with a stale low/unreliable accuracy value.

---

### 6. Home Sticker Shelf Overflow Layout

#### [MODIFY] [HomeScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/ui/home/HomeScreen.kt)
- Wrap the sticker text inside a single-line horizontally scrollable `Row` (`horizontalScroll(rememberScrollState())`) to prevent layout squishing when all 27 stickers are earned.

---

### 7. Release Configuration and Build Notes

#### [MODIFY] [build.gradle.kts](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/build.gradle.kts)
- Bump `versionCode` to `11`.
- Bump `versionName` to `"1.4.3"`.

#### [MODIFY] [sophiaspace-build-dashboard.html](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/docs/sophiaspace-build-dashboard.html)
- Append a dated changelog entry for **v1.4.3 (build 11)** in the `CHANGES` array.

#### [MODIFY] [index.html](file:///y:/ReynoldsFamily/builds/index.html)
- Update the builds website card version to `v1.4.3 · build 11` and the download path to `SophiasSpace-1.4.3.apk`.

---

## Verification Plan

### Automated Tests
- Run `.\gradlew.bat testDebugUnitTest` to verify all 57 tests remain green.

### Manual Verification
1. **Back-press**: Navigate to Home and press the system back button. Verify that the app does not crash and handles back-press gracefully.
2. **Drag-during-reset**: Move a planet, press "Put It Back", and simultaneously try to drag the planet mid-reset. Verify the planet ignores the drag and resets cleanly.
3. **Sensor accuracy**: Verify that starting a new session in Magic Window does not immediately play the calibration audio cue unless accuracy actually degrades.
4. **Sticker scroll**: Verify that when multiple stickers are present, the sticker shelf scrolls horizontally without compressing the navigation buttons on Home.
5. **Ducking in-flight**: Trigger a long sound effect (e.g. restoration fanfare) and trigger a narration line immediately after. Verify that the active sound volume is ducked dynamically.
