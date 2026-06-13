# Local Agent Correction, Codebase Audit, and Compiler Warning Resolutions

This plan addresses environment execution issues with the local agent runner on Windows, resolves duplicate branch compiler warnings in `Events.kt` by renaming colliding event IDs in both `Content.kt` and `Events.kt`, cleans up duplicate follow-up map entries, and outlines the game architecture audit.

## User Review Required

> [!IMPORTANT]
> * **Git Bash Command Integration**: The local agent runner executes shell commands through `cmd.exe` by default on Windows, which fails on POSIX commands (like `cat`, `tail`, `grep`, and `if [ -s ... ]`) in the agent workflows. We will patch `runner.py` to route commands through Git Bash if present.
> * **Renaming Colliding Event IDs**: Several events defined in `Content.kt` and matched in `Events.kt` share duplicate IDs. Kotlin matches only the first occurrence in `when (key)`, making the subsequent ones dead code and producing compile warnings. We will rename these colliding IDs to keep them unique and narrative-accurate.
> * **Duplicate followUps Map Keys**: In `Events.kt`, there are duplicate keys in the `followUps` map literal for `"faia_essay_blank:0"` and `"faia_essay_blank:1"`. The second entries override the first entries, breaking the JAM-038 fix. We will delete the duplicate entries.

## Proposed Changes

---

### Local Agent Runner & Git Synchronization

#### [MODIFY] [runner.py](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ArchitectGame/local-agents/runner.py)
* Update `run_bash_command` to check if the OS is Windows (`os.name == 'nt'`).
* Search for Git Bash at common install locations (e.g. `C:\Program Files\Git\bin\bash.exe`, `C:\Program Files (x86)\Git\bin\bash.exe`, or in system `PATH`).
* If found, execute commands as `[git_bash_path, "-c", cmd]` with `shell=False` to ensure POSIX compatibility. Fall back to standard shell command execution if not found.

---

### Game Content Declarations & Event Logic

#### [MODIFY] [Content.kt](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ArchitectGame/app/src/main/java/com/example/architectgame/Content.kt)
* Rename duplicate/colliding event IDs to ensure unique identifiers:
  1. `pro_bono_ask` (community garden pavilion, line 14801) → `pro_bono_pavilion_ask`
  2. `faia_essay_blank` (fellowship statement, line 16070-16161) → Delete older duplicate block (lines 16063-16162, the correct fixed version is at line 7775).
  3. `advisor_letter` (school transition reference, line 16529) → `advisor_letter_school`
  4. `elena_reference` (licensure character reference, line 16601) → `elena_reference_axp`
  5. `mentor_lunch` (lunch with junior practitioner, line 20163) → `mentor_lunch_senior`
  6. `mock_exam` (NCARB mock exam, line 19833) → `mock_exam_ncarb`
  7. `design_competition` (rural library ideas brief, line 22535) → `design_competition_library`
  8. `scope_creep` (client asking for extra work beyond contract, line 22049) → `scope_creep_extra`
  9. `materials_lab` (concrete/insulation materials class, line 21696) → `materials_lab_class`
  10. `exit_interview` (resignation and notice, line 21852) → `exit_interview_notice`
  11. `are_retake` (Prometric retake exam, line 21455) → `are_retake_exam`
  12. `redline_session` (PA marking up CDs with red pen, line 20970) → `redline_session_pa`
  13. `ncarb_transfer` (reciprocal state license paperwork, line 21006) → `ncarb_transfer_reciprocal`

#### [MODIFY] [Events.kt](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ArchitectGame/app/src/main/java/com/example/architectgame/Events.kt)
* Update the `when (key)` branch mappings to match the renamed event IDs:
  * `pro_bono_ask` (lines 2211, 2213, 2215) → `pro_bono_pavilion_ask`
  * `faia_essay_blank` (lines 2439-2460) → Delete duplicate branches.
  * `advisor_letter` (lines 2529, 2531) → `advisor_letter_school`
  * `elena_reference` (line 2543) → `elena_reference_axp`
  * `mentor_lunch` (lines 3192, 3194) → `mentor_lunch_senior`
  * `mock_exam` (lines 3212, 3214, 3216) → `mock_exam_ncarb`
  * `design_competition` (lines 3394, 3398) → `design_competition_library`
  * `scope_creep` (lines 3484, 3486, 3488) → `scope_creep_extra`
  * `materials_lab` (lines 3508, 3510) → `materials_lab_class`
  * `exit_interview` (lines 3538, 3540) → `exit_interview_notice`
  * `are_retake` (lines 3552, 3556) → `are_retake_exam`
  * `redline_session` (lines 3646, 3648) → `redline_session_pa`
  * `ncarb_transfer` (lines 3652, 3654) → `ncarb_transfer_reciprocal`
* In `followUps` map, delete the duplicate entries for `"faia_essay_blank:0"` and `"faia_essay_blank:1"` at lines 5142-5148, which were overriding the correct JAM-038 fix paths.

---

### Codebase Audit Overview

#### [NEW] [codebase_audit_map.md](file:///C:/Users/thoma/Dropbox/My%20Documents/Programs/ArchitectGame/docs/codebase_audit_map.md)
* Trace the engine flow, dynamic asset schemas, and transition validation checks. (Draft is currently sitting untracked, we will stage and commit it).

---

## Verification Plan

### Automated Tests
1. **Clean Gradle Compilation**:
   Run the Gradle compilation task to verify that the duplicate compiler warnings are resolved and the build compiles cleanly:
   ```powershell
   ./gradlew clean :app:compileDebugKotlin
   ```

### Manual Verification
1. Run the local orchestrator script to verify that agents execute commands successfully via Git Bash without failing on POSIX syntax:
   ```powershell
   PowerShell -ExecutionPolicy Bypass -File "local-agents/run-all-agents.ps1" -All
   ```
