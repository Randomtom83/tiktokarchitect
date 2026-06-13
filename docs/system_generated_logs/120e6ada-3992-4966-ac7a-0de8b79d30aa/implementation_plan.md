# Implementation Plan — Desktop Dashboard AJAX Overhaul

The goal is to overhaul the desktop web dashboard ([dashboard.php](file:///Y:/greenstories/TomOnly/lifeoftom/dashboard.php)) to handle all POST updates asynchronously using modern, inline AJAX `fetch()` calls. This will prevent full-page reloads, keep the sliding drawer open, preserve the user's active tab/scroll state, and provide instant visual feedback (glassmorphic toast notifications and smooth DOM updates).

## User Review Required

> [!IMPORTANT]
> **Action Item Notes Prompt:**
> When marking action items as `done` or `not_useful` (irrelevant), or when acknowledging patterns, we will prompt the user with a native browser `prompt()` to capture optional context/notes. If the user cancels the prompt, the action will be aborted. If they click OK (even with empty text), the action will be processed. This meets the requirements for supplying notes to the coaches.

---

## Proposed Changes

### Dashboard Application

#### [MODIFY] [dashboard.php](file:///Y:/greenstories/TomOnly/lifeoftom/dashboard.php)
1. **Modify POST Router (lines 402-406):**
   - Detect Fetch requests using `HTTP_X_REQUESTED_WITH === 'fetch'` header.
   - If the request is a Fetch request:
     - Execute the database transaction.
     - Query and return the updated agent state row if `agent` or `target_agent` is specified in the request (or if it's a reverted orchestrator action).
     - Return the annotation object if the action is `add_annotation`.
     - Respond with a JSON payload: `{"success": true, ...}`.
     - Skip the redirection and terminate immediately.
   - Otherwise, fall back to the standard page-reload header redirection.

2. **Add CSS styling for Toast notifications (lines 1140-1145):**
   - Inject style classes for `.toast-container`, `.toast`, `.toast.show` and `.toast-success-icon` using premium glassmorphism styling (blur backdrop, subtle borders, high contrast shadows).

3. **Add unique DOM IDs and attributes for live updates:**
   - Prepend container element IDs like `id="recent-notes-feed"` for the notes feed.
   - Add `id="agent-card-<?= h($a) ?>"` on the five coach cards.
   - Add data attributes (`data-field="stat"`, `data-field="summary"`, etc.) inside the cards so JS can update specific elements in-place.

4. **Add Frontend JS Interceptor:**
   - Listen globally to `'submit'` events on the document.
   - Prevent default form submissions for POST requests.
   - Extract `FormData` and intercept specific actions:
     - `feedback_inbox` / `pattern_feedback`: Prompt for optional notes and append them to the request payload.
     - `update_agent_memory` (delete mode): Ask for deletion confirmation before firing.
   - Dispatch `fetch(window.location.href, ...)` with header `'X-Requested-With': 'fetch'`.
   - On response:
     - Parse JSON. On success, show a visual toast.
     - For **Agent state updates** (summaries, guidelines, memory, threads, pauses): update client-side `agentData[agent]` and call `openAgentDrawer(agent, true)` (which we will update to accept a `preserveTab` flag), and update the main page's coach cards dynamically.
     - For **Action items / Patterns**: animate and remove/hide the row or update its priority stars instantly.
     - For **Orchestrator reverts**: update the log row inline to show a "reverted" class.
     - For **Annotations**: clear the input field and prepend the newly returned note to the note feed.

---

## Verification Plan

### Manual Verification
1. **Drawer Updates:**
   - Open any agent drawer (e.g. Therapist).
   - Go to "Guidelines" tab, add a new directive. Check that the directive appears instantly without closing the drawer or resetting the tab back to "Summary".
   - Go to "Memory" tab, edit a fact. Verify it updates in place. Click Delete, verify the confirmation prompt, and verify it disappears.
   - Toggle the coach status (Active/Pause) and ensure the status card renders the change instantly.
   - Check that the corresponding coach card on the main page is updated with the new details (analysis count, summary, threads, pause banner).

2. **Action Inbox Actions:**
   - Click the priority star on an inbox item. Check that it toggles color and class immediately.
   - Click "✓ done" or "✗" on an inbox item. Confirm that a prompt asks for optional notes. Type a note, press OK, and check that the row fades out and is removed.
   - Verify in the database (or the notes feed) that the note has been saved as `user_notes` for that item.

3. **Feedback Loop Annotations:**
   - Go to the "Agent Feedback Loop" panel on the main page. Select a conversation, type a note, and submit.
   - Verify that the textarea clears and the note is prepended to the "Recent Notes Surfaced" list without page reload.

4. **Orchestrator Revert:**
   - Click "revert" on a recent log entry. Check that the button is removed and replaced by "reverted just now" with a struck-through text style.
