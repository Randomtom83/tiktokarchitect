# Tasks — Desktop Dashboard AJAX Overhaul

## Phase 1: Controller Modifications
- [x] Update POST handling block in `dashboard.php` to support dual-mode (Fetch JSON vs redirect)
- [x] Fetch and return updated agent state data in the common fetch response
- [x] Fetch and return new annotation data details in the annotation response

## Phase 2: HTML/CSS Styling
- [x] Inject Toast notification CSS styles into `dashboard.php`
- [x] Add `id` and `data-field` attributes to agent cards on the main dashboard
- [x] Add `id` attribute to the recent notes feed container

## Phase 3: JavaScript Implementation
- [x] Implement `openAgentDrawer` updates to support the `preserveTab` flag and metrics chart redrawing
- [x] Implement the `formatWhenJS` timestamp formatter helper
- [x] Implement the `updateAgentCardOnPage` live card updater helper
- [x] Implement the `prependAnnotation` live annotation prepender helper
- [x] Implement the document-wide form submission submit interceptor (`fetch()`, confirmations, prompts)
- [x] Implement a glassmorphic toast notification creator function (`showToast`)

## Phase 4: Verification
- [x] Verify drawer updates (summary, guidelines, memory, threads, pauses) preserve tabs and reflect on cards
- [x] Verify action inbox items fade out on done/snooze/not_useful and support notes prompt
- [x] Verify priority star toggles render active/inactive class instantly
- [x] Verify feedback annotations prepend to feed
- [x] Verify orchestrator action reverts update row inline
