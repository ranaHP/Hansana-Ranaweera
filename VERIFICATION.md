# Verification — 1 November 2026

## Passed

- `npm run build`: Vite production React build completed. Public app, admin app and Three.js are separate lazy-loaded modules.
- `npm test`: 6/6 test groups passed against a real temporary MongoDB instance. Covers protected admin, published-only public data, HttpOnly/SameSite cookies, wrong-password rejection, CSRF and Origin rejection, draft isolation, optimistic concurrency, publish, retained history, restore-to-draft, content export, independent database connections seeing saved content, invalid layout/URL/hero rejection, actual image upload, spoofed-file rejection, media listing/archive, annual schedules and year-wrap dates.
- `npm run check:assets`: 25 seeded asset references exist, including original portrait, extended hero portrait, résumé, logos and supplied completion screenshots.
- `npm run verify:start`: spawned the actual Node entry point in production mode with its own MongoDB. Verified public health/API, admin SPA route, Content Security Policy and the built JavaScript asset. Fixed absolute `sendFile` fallback behavior for hidden checkout directories and used portable file-URL conversion for Windows/Linux and paths with spaces.
- Browser: React website loads with correct title, portrait, navigation, collections, original theme, no horizontal overflow and a `world-ready` WebGL scene. Built website on port 4000 had no console warnings/errors in the checked session.
- Browser: signed in through the real admin form. Changed theme to Halloween; saved draft; opened protected preview; changed portrait scale to 1.08; confirmed the rendered CSS transform; published locally; observed the public tab update through SSE; restored revision 1 into the draft and published the original appearance again.
- Browser: selected and previewed Christmas, saved Halloween and Christmas screenshots, then returned the saved draft to the original theme. Annual schedule remains off by default.
- Browser: search for React returned its real coursework record. Opening it displayed the supplied completion image. Native modal close behavior was exercised.
- Browser: at 390×844, immersive layout had no horizontal overflow. Switching to Quick mode removed the world canvas. Temporary viewport overrides were reset.

## Included previews

- `preview/admin-dashboard.png`
- `preview/website.png`
- `preview/mobile.png`
- `preview/halloween.png`
- `preview/christmas.png`

## Limits

- Docker configuration is supplied but was not executed here.
- Atlas, public HTTPS hosting, proxy-specific configuration and remote storage were not tested. This delivery runs locally.
- Vite reports a size advisory for the roughly 568 KB uncompressed Three.js module. It is lazy-loaded only in the immersive experience; Quick mode does not mount or request the world module.
- Geometry and entirely new page behaviors require React/Three.js source edits. All existing content, media, links, theme settings, hero composition, section visibility/order, safe layout tree and scene appearance are editable through the supplied admin.
- Demo database data is temporary. Persistent editing requires the documented MongoDB setup or Docker named volumes.
- Uploaded SVGs are intentionally unsupported; included SVG assets are retained. Media files require a separate filesystem backup alongside database backup.

## Repository layout

Migrated into `frontend`, `backend` and `shared` npm workspaces. Dependencies are installed from one root lockfile. Frontend build output, uploaded files, private environments, temporary demo login and node_modules are excluded from Git. Backend configuration resolves repository-root or backend-local environment files independently of the working directory.

## Enhanced Halloween mode

Added locally authored SVG scenery, a moon, bats, pumpkins, animated aurora/fog/fireflies and coordinated dark project-card colors. Desktop and 390px mobile previews were inspected; all scenery assets loaded and neither view had horizontal overflow. Mobile uses fewer fireflies. Existing motion/decor switches and system reduced-motion CSS cover the atmosphere. The temporary `theme=halloween` URL preview does not write to MongoDB; unsaved admin edits were confirmed intact during preview.

## Interactive Halloween — 2 November 2026

Production build passed. Browser checks confirmed the loaded AI monster image, aligned face hotspot, reveal/restoration, Escape behavior, pause/resume freezing both bat and lantern animations, and 390px mobile layout without horizontal overflow. Desktop uses four page-wide flying bats, mobile uses two. All decorative layers are pointer-transparent; the portrait hotspot and pause control are the only interactive additions. CSS disables ambient motion for reduced-motion and Appearance settings. No draft/published content was changed during preview.

## Single-toggle admin branch — 2 November 2026

Branch `feature/admin-halloween-toggle` adds an authenticated/CSRF-protected, atomic theme-only update. Seven MongoDB test groups passed, including preserving unpublished draft data, restoring different draft/live presets, respecting the motion preference, retaining history, rejecting malformed/unauthenticated/stale requests and disabling date overrides for explicit manual decisions. Browser checks on isolated ports 4001/5174 verified On → public Halloween, Off → original theme, preservation of an unsaved profile field, no publication of that field, and old public `theme=halloween` URLs following the admin setting. The original preview and its login cookie were left untouched. `SETUP.md` documents the complete non-Docker setup and production requirements.
