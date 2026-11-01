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
