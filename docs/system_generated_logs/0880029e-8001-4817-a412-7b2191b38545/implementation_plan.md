# Auditing and Fixing ShambaWorks Codebase

This implementation plan outlines the steps to audit the ShambaWorks Android app and Python agents codebase, disable the scheduled GitHub workflows, merge the latest flower data from GitHub, increment the database seed version, compile the project, and run unit tests to verify correctness.

## User Review Required

> [!NOTE]
> We will disable the scheduled cron triggers on GitHub for `the-plug` and `lab-breadth` workflows by commenting out their `schedule` cron configurations. These can still be triggered manually via `workflow_dispatch`.

> [!IMPORTANT]
> The seed version in `SeedVersion.kt` will be incremented from `4` to `5` to force the Android app to re-seed its Room database with the new flower data on startup.

## Proposed Changes

### GitHub Workflows

Comment out the scheduled cron triggers in the GitHub workflow configuration files to stop the nightly and weekly automated agent runs on GitHub.

#### [MODIFY] [the-plug.yml](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ShambaWorks/.github/workflows/the-plug.yml)
- Comment out the `schedule` block.

#### [MODIFY] [lab-breadth.yml](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ShambaWorks/.github/workflows/lab-breadth.yml)
- Comment out the `schedule` block.

---

### Data Layer & Seed Version

#### [MODIFY] [plants_flowers.json](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ShambaWorks/android/app/src/main/assets/plants_flowers.json)
- Splice in the 10 new unique flower entries discovered across the remote plug branches (`origin/bot/the-plug-2026-06-05` and `origin/bot/the-plug-2026-06-12`).

#### [MODIFY] [SeedVersion.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/ShambaWorks/android/app/src/main/java/com/shambaworks/app/data/local/seed/SeedVersion.kt)
- Increment `CURRENT_PLANTS_VERSION` to `5`.

---

## Verification Plan

### Automated Tests
- Run Gradle task to compile Kotlin sources:
  ```powershell
  ./gradlew.bat :app:compileDebugKotlin --no-daemon
  ```
- Run unit tests to verify no regressions:
  ```powershell
  ./gradlew.bat :app:testDebugUnitTest --no-daemon
  ```

### Manual Verification
- Verify that the 10 new flower entries are correctly loaded into `plants_flowers.json` and parsed cleanly.
- Produce a comprehensive markdown outline and audit report summarizing the codebase structure and comparing it against the North Star and purchase unit specifications.
