# Plan: Fix Stop Button Infinite WebSocket Loop & Audio Freezing

## 1. Goal
- **Fix soundboard freezing after clicking STOP ALL:**
  - Break the infinite broadcast loop where `stopAll()` in `engine.html` sent `{ stop: 1 }` via WebSocket, which was broadcast back to `engine.html` and triggered `stopAll()` recursively in an endless loop.
  - Eliminate the anti-pattern in `engine.html` where `send()` was doing `fetch('/list')` and spawning temporary WebSockets on every message.
  - Use the single persistent WebSocket connection (`clientWs`) for sending and receiving messages.
  - Prevent event listener recursion in `destroyAudio` by clearing `onended` and `onerror` before resetting `src` and calling `load()`.
  - Rebuild portable executable `v1.5.1` and update repository.

---

## 2. Scope & Files

### Files Allowed to Modify:
1. `engine.html`:
   - Store persistent WebSocket in `clientWs`.
   - Update `send(m)` to reuse `clientWs`.
   - Add `notify` parameter to `stopAll(notify = true)`:
     - When called from UI: `stopAll(true)` sends `{ stop: 1 }`.
     - When called from WebSocket `m.stop`: `stopAll(false)` does NOT re-send `{ stop: 1 }`.
   - In `destroyAudio(audio)`, clear `audio.onended = null; audio.onerror = null;` before calling `pause()`, `removeAttribute('src')`, and `load()`.
2. `package.json`:
   - Bump version to `1.5.1`.
3. `docs/plans/fix-stop-infinite-loop.md`:
   - Plan and execution progress.

### Non-Goals (Files Strictly Off-Limits):
- No modifications to `main.js` (server logic already supports standard WebSocket broadcast).
- No changes to `controller.html` (mobile already handles `m.stop` without echoing).
- No changes to `sounds/` or CI workflow.

---

## 3. Implementation Steps

### Step 1: Fix WebSocket Handling and `stopAll` Loop in `engine.html` [x]
- [x] Declare `let clientWs = null;`.
- [x] In `connect()`, assign `clientWs = new WebSocket(...)` and call `stopAll(false)` on `m.stop`.
- [x] In `send(m)`, check `clientWs && clientWs.readyState === WebSocket.OPEN` and send directly.
- [x] In `stopAll(notify = true)`, only call `send({ stop: 1 })` when `notify === true`.
- [x] In `destroyAudio(audio)`, clear `onended` and `onerror` handlers.
- [x] Verify with `node -e` JavaScript syntax check.

### Step 2: Bump Version in `package.json` & Build Portable EXE [x]
- [x] Bump version to `1.5.1`.
- [x] Run `npm run dist:portable` successfully generating `dist/Valorant-Soundboard-Portable.exe` (114.5MB).
- [x] Copy executable to root folder.
- [x] Merge to `main`, commit, and create tag `v1.5.1`.

---

## 4. Risks & Mitigations
- **Risk:** Mobile controller not receiving stop event.
  - **Mitigation:** When stop is clicked on desktop UI, `stopAll(true)` still sends `{ stop: 1 }` once, ensuring all mobile devices update their UI, while `stopAll(false)` breaks any echo loop.

---

## 5. Open Questions
- None. Root cause is clearly verified.
