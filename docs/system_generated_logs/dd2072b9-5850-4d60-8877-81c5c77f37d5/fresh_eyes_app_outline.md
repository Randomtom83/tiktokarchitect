# Sophia's Quest: Technical Codebase Outline (Fresh Eyes)

This document presents a comprehensive technical outline of the **Sophia's Quest** application, derived exclusively from direct inspection of the codebase (Kotlin source files, assets, package structures, and Room schemas) without reference to the external `docs` folder.

---

## 1. Core Architecture & System Design

### 1.1 Tech Stack & App Structure
* **Platform:** Android (written in Kotlin, target SDK 35 / Android 15 ready, page-aligned to 16KB support).
* **UI Framework:** Jetpack Compose (declarative layouts, Material Theme 3, responsive animations).
* **Local Persistence:** Room Database (version 5 schema, SQLite engine, automated migrations).
* **Navigation:** Compose-based custom type-safe backstack manager using a `NavKey` registry (`KidHub`, `KidToday`, `KidLiteracyHub`, `SpaceHome`, `ParentDashboard`, etc.).
* **Audio & Synthesis:** Native TTS engine wrapped with a custom content sanitizer, a real-time wave synthesizer for UI sounds (`SoundSynth`), and a stateful MediaPlayer background player (`AppMusicManager`).

### 1.2 Data Flow & Invariants
* **Non-Convertibility:** The app strictly separates child-oriented progress points (`Stars`) from parent-managed ledger cash (`Cents`) at the compile level using Kotlin `@JvmInline value class` wrappers (`Stars` vs `Cents`/`SignedCents`). There are no functions that allow converting Stars directly into Cents.
* **Append-Only Ledger:** Balance calculations for money jars are derived dynamically in SQLite using `SUM(amountCents)` from an append-only transaction table (`ledger_entries`), preventing arithmetic tampering.
* **Parental Approvals:** Extra jobs completed by the child do not award money immediately. They queue as `PENDING_APPROVAL` completions and require parent authentication and cryptographic-hash PIN verification.

---

## 2. Database Schema (Schema Version 5)

The database maintains 13 entity tables defined in [SophiaQuestDatabase.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/data/SophiaQuestDatabase.kt):
1. **`tasks`:** Stores chores. Fields include `id`, `title`, `starReward`, `rewardCents`, `isExtraJob`, `isArchived`, `reinforcementSchedule` (`CONTINUOUS`, `INTERMITTENT`, `GRADUATED`).
2. **`task_completions`:** Logs chore logs. Fields include `id`, `taskId`, `completionDate`, `completionType`, `status` (`COMPLETED`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`), `starsAwarded`.
3. **`ledger_entries`:** Append-only financial log. Fields include `id`, `jarType` (`SPEND`, `SAVE`, `GIVE`), `amountCents` (signed), `transactionType`, `timestamp`, `note`, `approvedCompletionId`.
4. **`save_goals`:** Saving milestones. Fields include `id`, `name`, `imageRef`, `targetCents`, `earnedCents`, `isActive`, `isCompleted`.
5. **`dragon_hatch_progress`:** Dragon progression tracking. Fields include `id`, `dragonName`, `dragonType`, `requiredStars`, `earnedStars`, `isHatched`, `stage` (`EGG`, `HATCHLING`, `BIG_KID`, `GRADUATED`), `status` (`ACTIVE`, `INACTIVE`), `hatchTimestamp`, `graduatedTimestamp`, `grewUpOnRoutines`, `skyStarsCount`.
6. **`settings`:** Key-value pairs for flags and configurations (`child_name`, `parent_pin`, `calm_mode`, `last_allowance_date`, etc.).
7. **`modules`:** Feature layer toggles (`routine`, `nook`, `jars`, `space`).
8. **`space_progress`:** Collectibles log for the Space module (`STICKER` or `CONSTELLATION`).
9. **`sight_words`:** Spaced repetition reading data (`wordId`, `meaningContext`, `isUnlocked`, `nextReviewDate`, `repetitionInterval`, `easinessFactor`).
10. **`graphemes`:** Grapheme split mapping for words (`graphemeId`, `wordId`, `orderIndex`, `text`, `phonemeSound`, `type`).
11. **`pa_activity_states`:** State tracker for phonological awareness activities (`activityId`, `status`).
12. **`phoneme_mastery`:** Mastery levels for phonemes (`phonemeSound`, `status`).
13. **`pa_content`:** Content items for PA activities (`contentId`, `activityId`, `targetSound`, `wordText`, `imageEmoji`).

---

## 3. Child-Facing Modules & UI Features

### 3.1 The Main Hub Screen (`HubScreen.kt`)
The portal selection screen that displays large, colourful cards representing active layers:
* **Daily Quest Portal:** Takes the child to the daily chores list.
* **Phonics World Portal:** Takes the child to early literacy activities.
* **Space Explorer Portal:** Blasts off to the physics/astronomy module (visible only if enabled by parent).

### 3.2 Daily Quest Module (`TodayScreen.kt`, `ToothbrushingScreen.kt`)
* **Task Checklist:** Lists chores grouped by time of day (Morning, Afternoon, Evening). Complete items check off, play synthesised chime sound effects, and increment the active dragon's star gauge.
* **Masot Interactivity:** Displays the active dragon mascot at the top of the checklist. The mascot wiggles and reacts on chore completion.
* **Toothbrushing Minigame:** A dedicated visual chore screen. Features a 2-minute countdown timer with a wiggling toothbrush, real-time instruction cues (e.g. "Brush top teeth"), and automatically completes/approves the chore on completion.
* **Sunday Allowance Overlay:** Triggered automatically when opening the app on Sunday if unpaid. Shows a pile of 5 physical gold coins that the child drags and drops into the Spend, Save, and Give jars to distribute their weekly $5.00 allowance based on parent-defined splits.

### 3.3 Dragon Nook & Playroom (`DragonNookScreen.kt`, `DragonSkyScreen.kt`)
* **Interactive Playroom (Nook):** Canvas-drawn environment showing the active dragon.
  * **Idle Affordances:** Interactive toys (pillow, chest, fruit bowl, ball) pulse slowly with soft glowing backgrounds.
  * **Drop Shadows:** Shadows beneath items scale and fade dynamically as elements bounce or jump, grounding them in space.
  * **Feeding & Play:** Child can drag apples/bananas to the dragon's mouth (plays munching sounds) or tap the ball to launch it in a physics-based bounce (shadow shrinks/fades dynamically).
  * **Graduation:** Once a dragon accumulates its required stars, it completes a graduation sequence and is moved to the "Sky Sanctuary".
* **Sky Sanctuary:** A cloud-based island displaying all graduated dragons. Features slowly drifting clouds, twinkling night stars, and a calm, stress-free relaxation interface.

### 3.4 Money Jars Module (`JarsScreen.kt`)
* **Three-Jar Ledger:** Shows visual representations of the Spend, Save, and Give jars. Tapping a jar opens a detailed view of its transaction ledger.
* **Goal Setting:** Inside the Save Jar, the child can create a saving goal, inputting a title and target amount, and watch a visual progress bar fill up as parent-approved funds are added.

### 3.5 Phonics World Module (`LiteracyHubScreen.kt`, `MeetTheWordScreen.kt`, `PaActivityScreen.kt`, `BlendItScreen.kt`)
* **Word Picker Grid:** Displays unlocked sight words dynamically from the database (`am`, `go`, `at`, `in`, `it`, `on`, `up`, `me`, `we`, `can`, `see`).
* **Meet the Word Screen:** A letter sounding-out interface.
  * **Phoneme Slider:** Child slides an interactive element under grapheme letters. Tapping or sliding plays custom-mapped phonics sounds (e.g., C says "cuh" instead of "kay", using `PhonemePronouncer`).
  * **Blending Walkthrough:** An animated, step-by-step introduction where letters come together to build a word, featuring spoken cues.
* **Blend It Minigame:** A drag-and-drop letter puzzle. Letters are scattered, and the child drags them into target slots to spell the word, hearing phonetic pronunciations when selected and placed.
* **Rhyme Garden:** A phonological matching minigame. The narrator reads a prompt, and the child taps cards to choose matching sounds (resets automatically upon re-entry; narrator terminates instantly on back-press to avoid sound bleeding).

### 3.6 Space Explorer Module (Space Sandbox)
A highly detailed astronomical sandbox with its own physics engine, astronomy math, and lessons:
* **Sandbox Screen:** Interactive orbits simulation. Drag/place planetary bodies, fire thrusters, and watch gravity interactions (Lagrangian trails, collision detection).
* **Day & Night Tracker:** Visualises earth's rotation, solar positioning, and local time synchronisation.
* **Moon Phases Screen:** Dynamic solar-lunar position slider showing phase angles (crescent, gibbous) with real-time astronomy calculations.
* **Rocket Screen:** Features interactive launch lessons:
  * *Gravity Turn Lesson:* Tap/steer launch vectors to achieve orbital insertion.
  * *Catch Mars Lesson:* Predict orbital rendezvous points to launch a probe from Earth to Mars.
* **Sky View Screen:** Real-time star map. Uses device orientation sensors (accelerometer/magnetometer) to overlay active constellations, stars, and celestial grids onto the screen.

---

## 4. Parent-Facing Features & Settings

### 4.1 Grown-up Gate (`GrownUpGate.kt`)
* **Double-layered verification:**
  1. A 2-second continuous button hold displaying a circular progress bar.
  2. If enabled, a custom 3x4 grid PIN-pad that checks a 4-digit passcode using a secure cryptographic PBKDF2 hash verify. Shows shake animation and error messages on invalid attempts.

### 4.2 Parent Dashboard (`ParentDashboardScreen.kt`)
* **Pending Approvals Queue:** Date-agnostic scrollable list of completed extra jobs awaiting reward distribution.
* **Jar Balances & Reconciliations:** Allows parents to audit child balances and post adjustments if physical savings ledger entries mismatch.
* **Holiday Override Toggle:** Toggles standard daily checklist configurations dynamically on holidays.

### 4.3 Task Manager (`TaskManagerScreen.kt`)
* **Chore Creation:** Add, edit, or archive tasks.
* **Rewards Configuration:** Assign Star quantities (for routine chores) or Cents values (for commission jobs).
* **Reinforcement Schedule:** Select between `CONTINUOUS` (always awards stars), `INTERMITTENT` (random 50% chance of stars), or `GRADUATED` (no stars, purely intrinsic motivation).

### 4.4 App Settings (`SettingsScreen.kt`)
* **Preset Profiles:** System configuration presets based on child age (Age 5, 6, 7, 8+). Adjusts app complexity (e.g., Age 8 automatically disables the dragon/mascot layer entirely to focus on ledger habits).
* **Feature Toggles:** Enable/disable layers (Routine Layer, Dragon Layer, Money Layer, Space Layer).
* **TTS Controls:** Volume, speed rate sliders.
* **Database Backup:** Encrypts local SQLite database using AES-256-GCM and exports/imports backup files securely.

---

## 5. Technical Utilities & Guardrails

* **`TtsSanitizer.kt`:** A hard safety filter that runs before TTS commands. Checks for emotionally manipulative or pressuring terms (e.g., "sad", "sick", "hungry", "earned", "mommy", "daddy") and blocks/rewrites prompts to maintain a healthy, guilt-free sensory environment.
* **`SoundSynth.kt`:** Real-time AudioTrack pulse-code modulation (PCM) sine/triangle wave generator for UI sounds, removing dependency on heavy mp3/wav files for basic feedback.
* **`BackupUtils.kt`:** Standard PBKDF2 key derivation and AES-GCM file cryptographer to ensure family chore/allowance history cannot be tampered with or read in plain text.
* **`SpacedRepetitionScheduler.kt`:** Implements an SM-2 (SuperMemo) algorithm that computes next review intervals and easiness factors dynamically based on user response inputs (1-5 scoring).
* **`Calm Mode`:** A global context state. When active, it disables wiggle animations, gold coin flight physics, wiggling toothbrushes, and halves orbital sandbox movement speeds to support sensory-sensitive users.
