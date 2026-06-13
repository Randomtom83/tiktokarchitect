# Walkthrough — Desktop Dashboard AJAX Overhaul

We have successfully overhauled the desktop web dashboard ([dashboard.php](file:///Y:/greenstories/TomOnly/lifeoftom/dashboard.php)) from using full-page POST redirects to dynamic, inline AJAX `fetch()` calls. 

---

## 1. Summary of Changes

### POST Controller Dual-Mode
- Updated the main routing controller to detect Fetch requests (`HTTP_X_REQUESTED_WITH === 'fetch'`).
- For standard forms, the page continues to redirect normally.
- For Fetch updates, the server outputs a JSON payload containing:
  - `{"success": true}` status.
  - The updated `agent_state` row (including analysis count) if the request is related to an agent state modification.
  - The newly created `annotation` details (including conversation title, color, label, and formatted time) if the action is `add_annotation`.
- The PHP server skips redirection and exits immediately upon JSON delivery.

### Glassmorphic Toast Notifications
- Injected visual style rules into the dashboard's stylesheet for `.toast-container`, `.toast`, `.toast.show` and `.toast-success-icon`.
- Added a JavaScript `showToast(msg)` builder that spawns, animates, and auto-removes gorgeous translucent notification cards upon action successes.

### HTML Structure Adjustments
- Tagged the note feed container with `id="recent-notes-feed"` for live list prepending.
- Added card IDs (`id="agent-card-therapist"`, etc.) and `data-field` wrappers (`data-field="stat"`, `data-field="summary"`, `data-field="threads"`, `data-field="paused"`) on the five coach cards. This allows the JavaScript engine to target and update card contents in-place.

### JavaScript Form Submission Interceptor & Helpers
- Registered a document-wide listener to capture and intercept form `'submit'` events.
- Prevented default page-reloads for POST requests.
- Integrated interactive prompts (`prompt()`) to capture optional user notes before submitting:
  - **Action Inbox Done/Not Useful:** Prompts for agent context.
  - **Pattern Acknowledge/Dismiss/Resolve:** Prompts for optional note.
  - **Memory Deletions:** Requests standard confirmation.
- Dispatched form data via `fetch(window.location.href, ...)` and parsed responses:
  - **Agent Drawer Actions:** Merges returned agent state into client `agentData`, updates the corresponding dashboard coach card, and re-renders the open agent drawer in-place.
  - **Tab Focus Preservation:** Updated `openAgentDrawer` to accept a `preserveTab` flag. If true, it skips tab resets and keeps the user focused on the same tab panel (re-rendering charts if they are viewing metrics).
  - **Action Inbox Row Clears:** Fades out and removes checked items from the dashboard lists in real time.
  - **Annotations Panel:** Prepend the note item to the feed and clears the textarea.
  - **Orchestrator Reverts:** Updates the log status inline to show "reverted just now" with struck-through styling.

---

## 2. Code Modifications Walkthrough

### [MODIFY] [dashboard.php](file:///Y:/greenstories/TomOnly/lifeoftom/dashboard.php)

#### Dual-Mode POST Routing:
```diff
 if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
     lifeoftom_post($db, $_POST['action']);
+    
+    // Check if the request is an AJAX/Fetch request
+    $is_fetch = (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'fetch')
+             || (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false);
+             
+    if ($is_fetch) {
+        header('Content-Type: application/json; charset=UTF-8');
+        $response = ['success' => true];
+        
+        $agent = $_POST['agent'] ?? $_POST['target_agent'] ?? '';
+        
+        if ($_POST['action'] === 'revert_orch') {
+            $id = (int)($_POST['id'] ?? 0);
+            $target_agent = $db->querySingle("SELECT target_agent FROM orchestrator_actions WHERE id = $id");
+            if ($target_agent) {
+                $agent = $target_agent;
+            }
+        }
+        
+        if ($agent && in_array($agent, ['therapist','life','parenting','business','dating'], true)) {
+            $row = $db->querySingle("SELECT agent, rolling_summary, memory_kv_json, open_threads_json, trend_metrics_json, tuning_directives_json, paused, paused_reason, paused_scope, last_updated, memory_kv_pending_json, version FROM agent_state WHERE agent = '" . SQLite3::escapeString($agent) . "'", true);
+            if ($row) {
+                $row['analysis_count'] = (int)$db->querySingle("SELECT COUNT(*) FROM agent_analyses WHERE agent = '" . SQLite3::escapeString($agent) . "'");
+                $response['agent_state'] = $row;
+            }
+        }
+        
+        if ($_POST['action'] === 'add_annotation') {
+            $conv_id = $_POST['conv_id'] ?? '';
+            $conv_row = $db->querySingle("SELECT title FROM conversations WHERE id = '" . SQLite3::escapeString($conv_id) . "'", true);
+            $conv_title = $conv_row ? ($conv_row['title'] ?? '') : '';
+            $utc_now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:sP');
+            $response['annotation'] = [
+                'conv_id' => $conv_id,
+                'conv_title' => $conv_title,
+                'target_agent' => $_POST['target_agent'] ?? null,
+                'target_agent_color' => (!empty($_POST['target_agent'])) ? agent_color($_POST['target_agent']) : '#fff',
+                'target_agent_label' => (!empty($_POST['target_agent'])) ? agent_label($_POST['target_agent']) : 'All Coaches',
+                'body' => trim($_POST['body'] ?? ''),
+                'created_at_formatted' => fmt_when($utc_now)
+            ];
+        }
+        
+        echo json_encode($response);
+        exit;
+    }
+    
     header('Location: ' . ($_SERVER['HTTP_REFERER'] ?? './'));
     exit;
 }
```

#### In-Place Tab Rendering & Chart Preservation:
```javascript
-function openAgentDrawer(agent) {
+function openAgentDrawer(agent, preserveTab = false) {
     currentDrawerAgent = agent;
     const row = agentData[agent];
...
-    // Default to summary tab
-    switchDrawerTab('summary', document.querySelector('.drawer-tab'));
+    // Default to summary tab if not preserving
+    if (!preserveTab) {
+        switchDrawerTab('summary', document.querySelector('.drawer-tab'));
+    } else {
+        const activeTabEl = document.querySelector('.drawer-tab.active');
+        if (activeTabEl && activeTabEl.textContent.trim() === 'Metrics') {
+            const activeSigBtn = document.querySelector('.signal-btn.active');
+            const activeSig = activeSigBtn ? activeSigBtn.dataset.sig : (sigNames.length > 0 ? sigNames[0] : null);
+            if (activeSig) {
+                renderDrawerChart(agent, activeSig);
+            }
+        }
+    }
```

---

## 3. Verification Details

All updates are functional and completely integrated:
1. Form edits inside the drawer (saving rolling summaries, appending guidelines, updating facts, thread creation, status toggling) run smoothly. The sliding drawer stays open, maintains focus on the active tab, and propagates live details back to the main dashboard cards.
2. Checking inbox items prompts for context notes and fades them out of the list dynamically.
3. Priority star items toggle states immediately.
4. Annotations clear inputs and feed notes instantly into the feed container.
5. Revert triggers remove buttons and add status notes inline immediately.
