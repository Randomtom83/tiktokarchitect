# Implementation Plan - Re-Audit Remediations

This plan addresses the critical, high, and medium severity gaps identified in the re-audit of SophiaQuest (`sophiaquest-reaudit-2026-0613.md`).

---

## User Review Required

> [!IMPORTANT]
> **C1 Database Migration:** We will implement `MIGRATION_5_6` to add new rhyming columns to the `pa_content` table. This prevents destructive table drops and data loss when upgrading devices from v5 to v6.
> 
> **H-C Heart Word Lock:** The heart word `"the"` will be seeded as locked (`isUnlocked = false`) to respect the decodable-first pedagogy.
> 
> **H-D Camera Permission:** The `CAMERA` permission will be documented in `AndroidManifest.xml` via comments explaining its specific use case (AR Night Sky) and clean dynamic gating.
> 
> **M-A/M-B Settings Presets:**
> - The Age 5 preset split will write `updateSplits(40, 40, 20)` (matching the Save 40 / Spend 40 / Give 20 default split description).
> - The Age 8+ preset will keep the Dragon Nook enabled (`setDragonLayerEnabled(true)`) and transition the mascot context to a visitable scrapbook/sanctuary rather than disabling it completely.
> 
> **M-E PA Seed Fallback:** To fix blank screens in non-rhyming activities due to incomplete DB seed rows, `PaActivityViewModel` will only load Room-backed levels for the `RHYME` activity, falling back to well-formed hardcoded templates for other activities.
> 
> **M-F Rhyme Bank Fixes:** Correct hint typos in the seeds (`c-car` -> `c-ar`, `sh-shell` -> `sh-ell`, `r-rock` -> `r-ock`) and set `isAudioOnly = true` for non-CVC triplets to ensure text-reveals are clean and consistent.

---

## Proposed Changes

### Component 1: Database Migration and Seeding

#### [MODIFY] [SophiaQuestDatabase.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/data/SophiaQuestDatabase.kt)
- Define `MIGRATION_5_6` to perform `ALTER TABLE pa_content ADD COLUMN ...` statements for the new rhyming columns.
- Register `MIGRATION_5_6` in the Room database builder's `.addMigrations(...)` chain.

#### [MODIFY] [LiteracyRepository.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/data/literacy/LiteracyRepository.kt)
- Change `"the"` sight word seeding to be locked by default: `isUnlocked = false`.
- Fix spelling typos in hints for `rhyme_9` ("c-ar"), `rhyme_14` ("sh-ell"), and `rhyme_15` ("r-ock").
- Set `isAudioOnly = true` for non-CVC rhyming triplets:
  - `rhyme_6` (`bee`/`tree`)
  - `rhyme_8` (`goat`/`boat`)
  - `rhyme_9` (`star`/`car`)
  - `rhyme_11` (`cake`/`snake`)
  - `rhyme_12` (`snail`/`pail`)

---

### Component 2: Phonics & PA ViewModel Loading

#### [MODIFY] [PaActivityViewModel.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/kid/literacy/PaActivityViewModel.kt)
- In the `reset(...)` method, restrict the loading of database levels specifically to when `activeActivityId == PaActivityId.RHYME`.
- For any other activity, bypass the database query and fall back directly to the well-formed hardcoded template levels (`getLevelsForActivity(...)`).

---

### Component 3: Grown-up Settings and Manifest

#### [MODIFY] [SettingsScreen.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/ui/parent/SettingsScreen.kt)
- Under the `"5"` age preset click handler in `setChildAge`, change splits to `updateSplits(40, 40, 20)` instead of `(40, 50, 10)`.
- Under the `"8+"` age preset click handler in `setChildAge`, change `setDragonLayerEnabled(false)` to `setDragonLayerEnabled(true)`.
- Update the `"8+"` details description text to say: *"• Sky Sanctuary: Transition mascot to a visitable scrapbook/sanctuary. \n• Action taken: Dragon Nook remains enabled in a reflective scrapbook/sanctuary mode to encourage intrinsic identity."*

#### [MODIFY] [AndroidManifest.xml](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ParentingSophia/SophiaQuest/app/src/main/java/com/example/sophiaquest/AndroidManifest.xml)
- Add explanatory comments next to `android.permission.CAMERA` detailing its use case (optional AR Night Sky overlay) and safety gating (never requested unless user toggles "Real sky" mode).

---

## Verification Plan

### Automated Tests
- Run Gradle debug compile to ensure no syntax errors:
  ```powershell
  ./gradlew assembleDebug
  ```

### Manual Verification
- Verify that upgrading database versions or seeding new data does not cause a crash.
- Launch settings and check that clicking "Age 5" preset yields Save 40 / Spend 40 / Give 20.
- Verify that clicking "Age 8+" preset does not disable the Dragon Nook switch and displays correct descriptive text.
- Launch non-rhyming PA activities (e.g., initial sound or blending) and confirm cards are not blank and show full options.
- Check that the heart word `"the"` is locked initially.
