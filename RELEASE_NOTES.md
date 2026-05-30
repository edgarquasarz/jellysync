## JellyTunes 0.4.0 — Lyrics, cover art modes, and smarter sync

This release adds lyrics sync, a cover art mode selector, a redesigned sync preview, and a large batch of reliability fixes across selection, storage estimation, and file handling.

### What's new

**Lyrics sync** — JellyTunes can now download `.lrc` sidecar files or embed lyrics directly into tracks. Works with Jellyfin 10.9+ (JSON format) and older servers (plain `.lrc`). Orphaned LRC files are cleaned up automatically when you switch modes.

**Cover art mode selector** — choose between embedded cover art and companion `cover.jpg` files per device. Your choice is remembered between sessions.

**Redesigned sync preview** — the preview modal now shows a three-column layout with per-category breakdowns (new / will update / will remove), a total row, and a selection summary with combined duration and estimated size before you start a sync.

**Smarter selection** — track sizes are estimated as you select, using batched Jellyfin fetches and tick-based sampling. A fetch threshold guard prevents accidental runaway requests on large libraries. Select All now handles pagination correctly on any library size and recovers gracefully from errors.

**Per-tab search** — Artists, Albums, and Playlists tabs each keep their own independent search query.

**Lazy image loading** — library cover art loads as rows scroll into view, reducing initial load time on large libraries.

### Fixed

- Stale `cover.jpg` and `.lrc` files are now cleaned up when switching cover art modes or removing items
- False "out of sync" detections after changing cover art mode
- Disk-full hangs and ghost rows in the sync database during large syncs
- Select All race condition on large libraries
- Storage bar showing inaccurate estimated sizes (`~` prefix now shown correctly while loading)
- Sync preview track counts and durations showing `undefined` in some cases
- Library images disappearing after load in certain scroll positions
- Several LRC file path handling edge cases

---

Full technical changelog: [CHANGELOG.md](CHANGELOG.md)
