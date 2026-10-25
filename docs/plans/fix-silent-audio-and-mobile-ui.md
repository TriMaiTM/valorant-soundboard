# Plan: Fix Intermittent Audio Dropout & Clean Mobile Controller UI

## 1. Goal
- **Fix intermittent audio dropout after prolonged use:**
  - Prevent Windows WASAPI audio stream exhaustion by properly destroying and releasing `Audio` resources (`src = ''`, `load()`).
  - Prevent Chromium renderer & timer suspension when running in background behind full-screen Valorant (`powerSaveBlocker`, `disable-renderer-backgrounding`, `disable-background-timer-throttling`, `disable-backgrounding-occluded-windows`).
  - Handle `setSinkId` rejections gracefully with fallback to default output so audio never drops silently.
  - Implement WebSocket keep-alive (15s heartbeat ping) to prevent silent connection dropouts.
  - Listen to `navigator.mediaDevices.ondevicechange` for seamless device recovery.
- **Clean Mobile UI:**
  - Remove all keybind tags (`num1`, `num2`, ..., `num0`) from `controller.html` so mobile pads are clean LCD buttons.
- **Package Release `v1.5.0`:**
  - Rebuild portable executable `dist/Valorant-Soundboard-Portable.exe` and update repository.

---

## 2. Scope & Files

### Files Allowed to Modify:
1. `main.js`:
   - Add Chromium background throttling disable switches and Electron `powerSaveBlocker`.
   - Add 15s WebSocket heartbeat ping to prevent TCP socket timeouts.
2. `engine.html`:
   - Implement `destroyAudio(audio)` to release WASAPI handles immediately on `ended`, `error`, and `stopAll()`.
   - Wrap `setSinkId` with fallback to default device on failure.
   - Add `navigator.mediaDevices.ondevicechange` handler to recover from device sleep/reconnect.
3. `controller.html`:
   - Remove keybind badges from sound pads (`pad-key-tag`) and the `STOP ALL` button (`#stop-key-badge`).
   - Remove obsolete keybind tag CSS.
4. `package.json`:
   - Bump version to `1.5.0`.
5. `docs/plans/fix-silent-audio-and-mobile-ui.md`:
   - Plan and execution progress.

### Non-Goals (Files Strictly Off-Limits):
- No modifications to `.github/workflows/*`.
- No modification to `run.vbs` or `run.bat`.
- No changes to sound files in `sounds/`.

---

## 3. Implementation Steps

### Step 1: Prevent Background Throttling & Add WebSocket Keep-Alive in `main.js` [x]
- [x] Add Electron `powerSaveBlocker.start('prevent-app-suspension')`.
- [x] Add command-line flags (`disable-renderer-backgrounding`, `disable-background-timer-throttling`, `disable-backgrounding-occluded-windows`).
- [x] Add periodic 15-second `ws.ping()` heartbeat on `wss`.
- [x] Verify with `node -c main.js`.

### Step 2: Implement Audio Stream Cleanup & Fallback in `engine.html` [x]
- [x] Add `destroyAudio(audio)` helper (`audio.pause(); audio.removeAttribute('src'); audio.load();`).
- [x] Call `destroyAudio` in `cleanup` and `stopAll`.
- [x] Wrap `setSinkId` calls in `try...catch` with default device fallback.
- [x] Attach `navigator.mediaDevices.ondevicechange` to refresh device lists.
- [x] Verify with syntax check script via `node -e`.

### Step 3: Remove Keybind Badges from Mobile Controller in `controller.html` [x]
- [x] Remove `<span class="pad-key-tag">${assignedKey}</span>` from `renderButtons()`.
- [x] Remove `#stop-key-badge` from `STOP ALL` button markup and update handler.
- [x] Clean up `.pad-key-tag` CSS rule.
- [x] Verify mobile rendering and JS syntax.

### Step 4: Rebuild Portable EXE & Release Tag [ ]
- Run `npm run dist:portable`.
- Commit changes with Conventional Commits.
- Merge branch into `main` and tag `v1.5.0`.

---

## 4. Risks & Mitigations
- **Risk:** High-frequency audio playback creating and destroying many elements quickly.
  - **Mitigation:** Immediate WASAPI handle release via `audio.src = ''; audio.load();` prevents handle leaks.
- **Risk:** Virtual audio cables entering sleep state when unused.
  - **Mitigation:** Fallback logic allows playback even if `setSinkId` temporarily fails.

---

## 5. Open Questions
- None. Requirements are clear.
