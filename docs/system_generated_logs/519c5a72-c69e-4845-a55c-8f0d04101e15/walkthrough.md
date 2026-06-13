# Walkthrough: Audit Findings and Release v1.4.3 (build 11)

This document details the audit fixes, verification results, and release deployment for version **v1.4.3 (build 11)** of Sophia's Space.

## 🛠️ Changes Implemented

### 1. Robust TTS Initialization and Fallback
- **Modified**: [NarrationManager.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/audio/NarrationManager.kt)
- **Fix**: Added tracking of `initFailed`. If the TTS engine fails to initialize (or if the US English locale is unavailable), a Toast message is displayed: *"Text-to-Speech failed to start. Please check your system US-English voice settings!"*. Additionally, if `speakText` is subsequently called and the engine is in a failed state, it attempts to re-initialize TTS automatically, recovery-guarding subsequent narration requests.

### 2. Navigation Back-Press Crash Guard
- **Modified**: [Navigation.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/Navigation.kt)
- **Fix**: Guarded the system back-press callback on the `Home` screen so that it only pops the backstack if it contains more than one screen (`backStack.size > 1`). This prevents popping the root home screen, which was causing Jetpack Navigation3 to crash when pressing back on the home dashboard.

### 3. Drag-During-Reset Sandbox Guard
- **Modified**: [SandboxScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/ui/sandbox/SandboxScreen.kt)
- **Fix**: Added logic to ignore and abort planet drag gestures when the reset tween is active. Checked inside `onDrag` and the `release()` helper to prevent user touch input from overriding target coordinates during tween animation.

### 4. Dynamic SoundPool Re-Ducking
- **Modified**: [SoundSynth.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/audio/SoundSynth.kt)
- **Fix**: Added tracking of active SoundPool streams in a thread-safe set (`ConcurrentHashMap.newKeySet<Int>()`). Streams are pruned from the set after 3 seconds. The custom setter for `volumeScale` dynamically loops through all active stream IDs and calls `pool.setVolume(streamId, scale, scale)` to retroactively duck already playing sounds (e.g., fanfare chimes) whenever narration kicks in.

### 5. Stale Sensor Accuracy Cleanup
- **Modified**: [OrientationProvider.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/src/main/java/com/example/sophiaspace/sky/OrientationProvider.kt)
- **Fix**: In the `stop()` method, reset the accuracy flow value back to `SensorManager.SENSOR_STATUS_ACCURACY_HIGH` to prevent starting the next AR/Magic Window session with a stale low/unreliable sensor status value.

### 6. Home Sticker Shelf Overflow Layout
- **Modified**: [HomeScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/ui/home/HomeScreen.kt)
- **Fix**: Wrapped the sticker text items in a horizontally scrollable `Row` container (`Modifier.horizontalScroll(rememberScrollState())`) to prevent layout squishing/overflow issues on the main Home dashboard when all 27 stickers are earned.

### 7. Documentation and Release Configuration
- **Modified**: [build.gradle.kts](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/app/app/build.gradle.kts) + [sophiaspace-build-dashboard.html](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Solar%20System/docs/sophiaspace-build-dashboard.html) + [index.html](file:///y:/ReynoldsFamily/builds/index.html)
- **Fix**: Bumped the gradle build versioning to `versionCode = 11` and `versionName = "1.4.3"`. Appended the changelog entry in the build dashboard, and updated the download site card/download links to point to the new APK version.

---

## 🧪 Verification & Verification Results

### 1. Automated Tests
Ran the Gradle unit tests to ensure zero regressions across all modules.
- **Command**: `.\gradlew.bat testDebugUnitTest`
- **Result**: `BUILD SUCCESSFUL` with all **57/57** unit tests green.

### 2. Build Assembly
- **Command**: `.\gradlew.bat assembleDebug`
- **Result**: Successfully compiled the debug APK `app-debug.apk`.
- **Copy**: Copied the APK to `Y:\ReynoldsFamily\builds\SophiasSpace-1.4.3.apk`.

### 3. On-Device Deployment
- **Status**: The target device IP `192.168.50.67` is currently pingable, but its wireless debugging port is closed. Once wireless debugging is enabled/connected, the package can be updated directly via ADB:
  ```powershell
  adb connect 192.168.50.67:<port>
  adb install -r "Y:\ReynoldsFamily\builds\SophiasSpace-1.4.3.apk"
  ```
