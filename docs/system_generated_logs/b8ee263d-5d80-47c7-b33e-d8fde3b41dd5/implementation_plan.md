# Implementation Plan: Codebase Gap Report Resolutions

This plan details the implementation steps to resolve the 22 gaps and edge cases identified in the Lakou codebase audit. These changes are organized by priority to resolve crashes first, followed by usability gaps, missing features, and code quality improvements.

---

## User Review Required

> [!IMPORTANT]
> **1. Database Schema Update (v5 Migration):**
> We will upgrade the SQLite database version to `5`. This migration will:
> - Drop the retired `quests` and `xp_log` tables to prevent database bloat.
> - Add `billing_method` (`'hourly' | 'flat-fee' | 'milestone'`) and `billing_frequency` (`'weekly' | 'monthly' | 'bi-weekly'`) to the `projects` table.
> 
> **2. Calendar Integration Permissions:**
> We will declare the `READ_CALENDAR` and `WRITE_CALENDAR` permissions in the `AndroidManifest.xml` and include them in the runtime permission request dialog on startup or when the Planner screen calendar block is triggered.
> 
> **3. Client Intake Automation:**
> When the intake form sync succeeds, we will automatically parse the client details (Name, Email, Phone, Company, Billing Address) from the JSON payload, insert/update the `clients` table, and link the project to the client in SQLite.

---

## Proposed Changes

### 1. Crash Prevention & Permissions (Priority 1)

#### [MODIFY] [AndroidManifest.xml](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/android/app/src/main/AndroidManifest.xml)
- Add calendar permissions:
  ```xml
  <uses-permission android:name="android.permission.READ_CALENDAR" />
  <uses-permission android:name="android.permission.WRITE_CALENDAR" />
  ```

#### [MODIFY] [MainActivity.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/android/app/src/main/kotlin/com/greenstories/lakou/MainActivity.kt)
- Add `Manifest.permission.READ_CALENDAR` and `Manifest.permission.WRITE_CALENDAR` to the `wanted` permissions list inside `requestRuntimePermissions()`.

#### [MODIFY] [claude_extractor.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/capture/claude_extractor.dart)
- Make Claude JSON response parsing defensive:
  * Check if the API response is null, if `response['content']` is a non-empty List, and if the first block is a Map containing the `'text'` key.
  * Update `_extractLocally` (Tier 1 fallback) with regexes to parse actual date formats (e.g., `YYYY-MM-DD`, `MM/DD/YYYY`, `Month DD`) instead of only keywords.

#### [MODIFY] [today_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/today/today_provider.dart)
- Wrap the meetings SQL query in a try-catch block to prevent crashes if the schema or table hasn't migrated yet.
- Convert `ambientProjectProvider`'s return type from `Map<String, dynamic>?` to a typed class `AmbientProjectInfo`.

---

### 2. Authentication & Triage UI (Priority 2)

#### [MODIFY] [dropbox_auth_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/auth/dropbox_auth_provider.dart)
- In `signIn()`, remove the immediate state reset to `.data(null)`. Let it remain in `.loading()`.
- Add a 3-minute timeout backup that resets the state back to `.data(null)` if the external auth flow isn't completed, preventing permanent UI lock.
- Update/remove the outdated comment about the deep link handler.

#### [MODIFY] [app_links_handler.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/auth/app_links_handler.dart)
- On successful deep-link token exchange, set `ref.read(dropboxAuthProvider.notifier).state = const AsyncValue.data(null)`.
- On error/DioException, assign `AsyncValue.error` to `dropboxAuthProvider` so the dashboard displays the human-readable failure reason instead of failing silently.

#### [MODIFY] [fieldy_inbox_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/fieldy/fieldy_inbox_screen.dart)
- Implement auto-pagination looping inside `_fetchMore()`. If a page is fetched and all conversations are filtered out (dismissed/assigned), loop to pull the next page until at least 5 triagable meetings are loaded or `hasMore` is false.

#### [MODIFY] [sms_listener.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/capture/sms_listener.dart)
- Implement carrier retry deduplication by storing message keys (`${sender}_${body}_${timestamp ~/ 5000}`) and ignoring duplicate broadcasts within a 5-second window.

---

### 3. Task, Expense, and Milestone Management (Priority 3)

#### [MODIFY] [tasks_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/tasks/tasks_provider.dart)
- Add an `update(int id, {required String title, int? projectId, DateTime? due, String? plannedDate})` method to `TaskRepo`.

#### [MODIFY] [tasks_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/tasks/tasks_screen.dart)
- Add `onLongPress` handling to task list cards that launches a reusable `_showEditTaskSheet(BuildContext context, WidgetRef ref, TaskRow task)` dialog.

#### [MODIFY] [planner_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/tasks/planner_screen.dart)
- Add the same `onLongPress` task editing sheet logic to carry-overs, backlog items, and today's slots.

#### [NEW] [expenses_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/expenses/expenses_provider.dart)
- Implement `ExpenseRow` class and `ExpensesRepo` (methods: `update()`, `delete()`, `list()`).
- Expose `expensesProvider` and `projectExpensesProvider` (family of project ID).

#### [NEW] [expenses_list_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/expenses/expenses_list_screen.dart)
- Create a list screen for all logged expenses, supporting view, edit, and delete options.
- If an expense is edited and the project/amount/vendor changed, the Dropbox filename will be updated, the new sidecar JSON written, and the old files deleted from Dropbox (if connected).

#### [NEW] [milestones_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/projects/milestones_provider.dart)
- Implement `MilestoneRow` class and `MilestonesRepo` (methods: `create()`, `update()`, `delete()`).
- Expose `projectMilestonesProvider(int projectId)`.

#### [MODIFY] [project_detail_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/projects/project_detail_screen.dart)
- Add client Name, Email, and Phone to the project detail model and display them on the glance header card.
- Add an **Edit Project Details** sheet allowing Tom to update the project phase, status, contract fee, blended rate, billing method, and billing frequency.
- Integrate a **Milestones** manager section displaying the list of project milestones, allowing Tom to toggle their invoiced status, edit target dates/percentages, or add new milestones.
- Modify `_FeeBurnCard` to adapt to the billing method: show the hourly ratio for hourly billing, or the percentage of milestones invoiced for flat-fee/milestone billing.

---

### 4. Client Intake, Category Reports, & Settings (Priority 4)

#### [MODIFY] [intake_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/intake/intake_screen.dart)
- Update `_pollIntakeOnce` to parse client contact details from the incoming submission JSON, check if the client already exists in SQLite, insert/update the `clients` table, and assign the `client_id` to the project.

#### [MODIFY] [timetrack_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/timetrack/timetrack_screen.dart)
- Query time entries logged in the last 7 days grouped by category (`design`, `meeting`, `site visit`, `coordination`, `admin`).
- Display a **Weekly Category Summary** card at the top showing hours logged per category with horizontal progress bars representing the percentage share.

#### [NEW] [settings_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/settings/settings_screen.dart)
- Create a Settings screen containing navigation to:
  * Watched Senders Screen (`/settings/watched-senders`)
  * Consultants Directory Screen (`/settings/consultants`)

#### [NEW] [consultants_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/settings/consultants_provider.dart)
- Create provider to list and search contacts in the `consultants` table, with methods to pin/unpin or delete a consultant.

#### [NEW] [consultants_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/settings/consultants_screen.dart)
- Create a contact/consultant management UI allowing Tom to search through all consultants, view detail counts, pin favorites, or delete outdated consultant records.

#### [MODIFY] [dashboard_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/dashboard/dashboard_screen.dart)
- Add a settings icon button in the header title block leading to `/settings`.
- Add an **Expenses** card under accounting leading to `/expenses`.

#### [MODIFY] [app.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/app.dart)
- Register new routes:
  * `/settings` -> `SettingsScreen`
  * `/settings/consultants` -> `ConsultantsScreen`
  * `/expenses` -> `ExpensesListScreen`

---

### 5. Code Quality & Security (Priority 5)

#### [MODIFY] [db.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/core/db.dart)
- Increment database version to `5`.
- Implement `_migrateV5` to:
  * Drop retired tables `quests` and `xp_log`.
  * Add `billing_method` and `billing_frequency` columns to the `projects` table.

#### [MODIFY] [dropbox_client.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/core/dropbox_client.dart)
- Add a `delete(String path)` method to delete a file from Dropbox (`/files/delete_v2`).

#### [MODIFY] [SmsReceiver.kt](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/android/app/src/main/kotlin/com/greenstories/lakou/SmsReceiver.kt)
- Declare `methodChannel` as `@Volatile` to ensure thread-safety across receiver threads.

#### [MODIFY] [share_routing_screen.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/capture/share_routing_screen.dart)
- Add verification to check if the shared `filePath` is not inside internal protected folders (e.g. `databases` or `shared_prefs`) before reading/saving it, preventing path traversal vulnerabilities.

#### [MODIFY] [watched_senders_provider.dart](file:///c:/Users/thoma/Dropbox/My%20Documents/Programs/Lakou/Lakou/lib/features/settings/watched_senders_provider.dart)
- In `watchedSendersProvider`, log the exact error and stack trace using `Trace.log` instead of silently catching and ignoring parsing failures.

---

## Verification Plan

### Automated Tests
- Run `flutter test` to verify that all existing tests pass and we introduce no regressions.
- Add test assertions to verify local date extraction heuristics in `filename_builder_test.dart` and `claude_extractor` unit tests.

### Manual Verification
1. **Calendar Permissions**: Launch Planner, verify calendar is queried without exception, and the dialog requests permissions if missing.
2. **Task Editing**: Long-press a task in Backlog or Today, change its title and project, save and verify it updates.
3. **Expense Listing & Editing**: Capture a mock receipt. Navigate to the Expenses list screen. Verify details are displayed. Edit the receipt vendor and check that the old file is deleted and the new file uploaded on Dropbox.
4. **Milestone Tracking & Detail Edits**: Go to a project detail page. Verify the client info is displayed. Set the billing method to Milestone, add two milestones, invoice one, and verify the burn card updates to show milestone completion progress.
5. **Fieldy Pagination**: Connect a mock Fieldy API key. Verify that if multiple recordings are assigned/dismissed, the page auto-paginates until unassigned records are loaded.
6. **Intake Processing**: Trigger an intake check. Confirm the submitted form automatically populates the `clients` table and links it to the project.
7. **Time Categories**: Track 5 minutes on "site visit" and 5 minutes on "design". Verify the weekly summary card on the Timer screen reflects the proportions.
8. **Settings & Consultants**: Search for a contact in the new consultants directory. Pin the contact, verify it stays at the top.
