# Implementation Plan — Sophia's Quest Remediation Batch

This plan details the changes to resolve the safety, developmental, and coordination issues identified in the code audit.

## Proposed Changes

### 1. TTS Sanitizer & Static Strings rewording

#### [MODIFY] [TtsSanitizer.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/utils/TtsSanitizer.kt)
- Remove `"mommy|mom|mother"` from the banned regex in line 16. This aligns the sanitizer with the core clinical intent (prevent comparisons, not ban references to parent identity).

#### [MODIFY] [ToothbrushingScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/ToothbrushingScreen.kt)
- Reword static TTS prompts containing the banned word `"earned"`:
  - Lines 133 and 194: Change `"Super job! Your teeth are sparkling clean! You earned a star!"` to `"Super job! Your teeth are sparkling clean! A star is here for you!"`.
- Wrap TTS speech call in a `try-catch` block:
  - Inside `speak(text)`: Call `TtsSanitizer.sanitize(text)` and pass the sanitized text to `tts.speak`. On exception, catch, call `DevLogger.log(context, "TTS_BLOCKED", ...)`, and fail-closed (no speech).

#### [MODIFY] [TodayScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/TodayScreen.kt)
- Reword static TTS prompts containing `"earned"`:
  - Line 612: Change `"You have earned ${state.earnedStars} of $target stars!"` to `"You have gathered ${state.earnedStars} of $target stars!"`.
- Wrap TTS speech call in a `try-catch` block:
  - Inside `speak(text)`: Call `TtsSanitizer.sanitize(text)` and pass sanitized text to `tts.speak`. On exception, catch, log to `DevLogger`, and fail-closed.

#### [MODIFY] [DragonNookScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/DragonNookScreen.kt)
- Reword static TTS prompt in line 1173:
  - Change `"Earn more stars to help me hatch!"` to `"Gather more stars to help me hatch!"`.
- Wrap TTS speech calls in a `try-catch` block:
  - Inside `speak(text)` and `speakIntermittent(text)`: Call `TtsSanitizer.sanitize` on spoken strings. On exception, catch, log, and fail-closed.

#### [MODIFY] [JarsScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/JarsScreen.kt)
- Reword static TTS prompt in line 153:
  - Change `"Complete extra jobs to earn coins!"` to `"You can do extra jobs to add coins!"`.
- Wrap TTS speech calls in a `try-catch` block:
  - Inside `speak(text)` and `speakCount(cents)`: Call `TtsSanitizer.sanitize`. On exception, catch, log, and fail-closed.

#### [MODIFY] [DragonSkyScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/DragonSkyScreen.kt)
- Wrap TTS speech calls in a `try-catch` block:
  - Inside `speak(text)`: Catch exception, log to `DevLogger`, and fail-closed.

---

### 2. Calm Mode (Reduced Motion) Animation Fixes

#### [MODIFY] [JarsScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/JarsScreen.kt)
- Retrieve `calmMode` in `JarsScreen`:
  `val calmModeStr by repository.getSettingFlow("calm_mode", "false").collectAsState(initial = "false")`
  `val calmMode = calmModeStr == "true"`
- Pass `calmMode` to `JarDetailDialog`.
- Inside `JarDetailDialog`: Disable entrance and tap wiggles when `calmMode` is true.

#### [MODIFY] [ToothbrushingScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/ToothbrushingScreen.kt)
- Retrieve `calmMode` from settings:
  `val calmModeStr by repository.getSettingFlow("calm_mode", "false").collectAsState(initial = "false")`
  `val calmMode = calmModeStr == "true"`
- Scale/pulse the sleeping/brushing mascot only when `calmMode` is false.

#### [MODIFY] [DragonSkyScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/DragonSkyScreen.kt)
- Retrieve `calmMode` from settings:
  `val calmModeStr by repository.getSettingFlow("calm_mode", "false").collectAsState(initial = "false")`
  `val calmMode = calmModeStr == "true"`
- Pass `calmMode` to `AnimatedDragonMascot` call.
- Disable the `bobOffset` bobbing translation if `calmMode` is true.

---

### 3. Sunday Allowance Mini-Game Split & Calm Mode

#### [MODIFY] [TodayScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/TodayScreen.kt)
- Pass `repository` and `calmMode` to `SundayAllowanceOverlay`.
- Inside `SundayAllowanceOverlay`:
  - Load split settings: `jar_split_save` (default 40), `jar_split_spend` (default 50), `jar_split_give` (default 10).
  - Dynamically allocate the 5 `CoinAnimState` slots by pairing 10 half-dollars according to split settings.
  - Implement coin collection/tap logic to dynamically add $1.00 (or two $0.50 splits) to the matching jars.
  - If `calmMode` is true, disable the flying transition and immediately snap coin progress to 1f (teleporting them instantly).

---

### 4. Money Parse Inconsistency Fix

#### [MODIFY] [TaskManagerScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/parent/TaskManagerScreen.kt)
- Replace line 494 double-to-int conversion with `Math.round()` to prevent truncation errors (e.g. `$1.15` resulting in `114` cents).

---

### 5. Documentation & Dashboard Reconciliations

#### [NEW] [code_audit_2026-06-12.md](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/docs/code_audit_2026-06-12.md)
- Create a detailed, dated audit report documenting findings and intent-vs-actual gaps (progressive disclosure, decoupled money, safe TTS sanitizer, calm mode).

#### [MODIFY] [sophiaquest-build-dashboard.html](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/docs/sophiaquest-build-dashboard.html)
- Mark Phase C (honest money) tasks done.
- Update `CHANGES` array with a new changelog entry for this remediation batch.
- Reconcile `state.fixed` initial state for audited findings to reflect reality.

---

## Verification Plan

### Automated Tests
- Run the full unit test suite:
  ```powershell
  ./gradlew.bat testDebugUnitTest
  ```

### Manual Verification
- Compile and install on the connected ADB device:
  ```powershell
  ./gradlew.bat installDebug
  ```
- Verify TTS sanitizer block triggers (log output via `DevLogger` is created without app crashing).
- Verify Sunday Allowance splits are dynamic and match actual ledger splits.
- Verify Calm Mode completely disables motion (confetti, bobbing, wiggles, coin flight).
