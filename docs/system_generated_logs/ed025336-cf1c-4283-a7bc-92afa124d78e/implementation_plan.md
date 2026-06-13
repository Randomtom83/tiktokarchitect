# Implementation Plan: Dragon Hatch Flow & Toothbrushing Parent Bypass

This plan addresses:
1. The bug where the dragon egg reaches the required star count but does not show a hatch celebration UI, causing subsequent stars to be awarded to the next unhatched dragon hidden in the database (which makes the UI appear as if it "lost count of the points through the day").
2. The request for a parent-bypass "Easter Egg" to mark toothbrushing as done without running the full timer, by holding (long-pressing) the dragon mascot on the toothbrushing screen.

---

## Proposed Changes

### Component 1: Today Screen UI & ViewModel

#### [MODIFY] [TodayScreen.kt](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/TodayScreen.kt)
- **ViewModel Updates:**
  - Update `TodayUiState.Success` signature to include `val activeDragonId: Long`.
  - Inside `TodayViewModel.uiState` flow construction, map `activeDragonId = activeDragon?.id ?: 0L` to `TodayUiState.Success`.
  - Add method `fun acknowledgeHatch(dragonId: Long)` to `TodayViewModel` that launches a coroutine calling `repository.acknowledgeDragonHatch(dragonId)`.
- **UI Screen Updates:**
  - If `state.isHatched` is true in `TodayScreen.kt`, replace the standard star progress bar `Card` with a premium **Celebratory Card**:
    - Background: Warm light gold/yellow (`0xFFFFF9C4`).
    - Title: `"🎉 [state.activeDragonName] Hatched! 🎉"` in dark purple.
    - Subtext: `"Your baby [state.activeDragonType] is ready to play in the nook!"`.
    - Action Button: `"Get Next Egg! 🥚"` which plays the fanfare sound using `SoundSynth.playFanfare()` and calls `viewModel.acknowledgeHatch(state.activeDragonId)`.

---

### Component 2: Toothbrushing Parent Bypass

#### [MODIFY] [ToothbrushingScreen.kt](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/ToothbrushingScreen.kt)
- Import `androidx.compose.ui.input.pointer.pointerInput` and `androidx.compose.foundation.gestures.detectTapGestures`.
- Bind a `pointerInput(Unit)` gesture detector to the dragon mascot `Box` with `onLongPress`:
  - If long-pressed and timer has not finished:
    - Trigger completion: call `SoundSynth.playFanfare()`.
    - Set `timeLeft = 0`, `isRunning = false`, and `hasFinished = true`.
    - Speak: `"Super job! Your teeth are sparkling clean! You earned a star!"`.
    - Launch coroutine calling `repository.completeTask(taskId, SophiaQuestRepository.getCurrentDateString(), autoApprove = true)`.
  - Implement standard single `onTap` gesture to read out status (e.g. `"Brushing teeth!"` or `"Sleeping dragon."`).

---

### Component 3: Unit Tests

#### [MODIFY] [SophiaQuestRepositoryTest.kt](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/test/java/com/example/sophiaquest/SophiaQuestRepositoryTest.kt)
- **Fix Test Failure:**
  - In `testRoutineChoreAwardsStarsAndHatchesDragon()`, once Sparky reaches 10/10 stars and is confirmed to be hatched, call `repository.acknowledgeDragonHatch(sparky.id)` to simulate the child acknowledging the hatch.
  - This transitions the repository's `activeHatchingDragon` flow to Bubbles so that the final assertions expecting Bubbles to be the active hatching dragon pass correctly.

---

## Verification Plan

### Automated Tests
- Run unit tests using:
  ```powershell
  .\gradlew.bat testDebugUnitTest
  ```
- Verify all 16 tests in `SophiaQuestRepositoryTest`, `PinSecurityTest`, `InvariantsTest`, and `TtsSanitizerTest` compile and pass.

### Manual Verification
1. **Dragon Hatch Flow:**
   - Turn on the Dragon Layer in settings.
   - Complete chores to earn enough stars to hatch the active dragon.
   - Verify that once the star count is met, the celebratory card is displayed on the Today screen.
   - Verify that the mascot shows the fully hatched baby dragon.
   - Tap "Get Next Egg!" and verify the card transitions back to the progress bar for the next egg.
   - Verify that extra stars earned after the first egg hatched but before acknowledging the hatch are preserved on the next egg.
2. **Toothbrushing Bypass:**
   - Open the Toothbrushing screen.
   - Tap the sleeping dragon. Verify it reads the idle status.
   - Click and hold (long press) the sleeping dragon.
   - Verify the screen immediately finishes, plays the fanfare chime, and registers the chore as completed.
