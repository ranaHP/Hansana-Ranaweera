# API reference

All endpoints return JSON except static files and the event stream. API responses are not cached. Validation errors return `400` with an `issues` array. Authentication failures are `401`; rejected CSRF/origin is `403`; stale versions are `409`; oversized uploads are `413`.

## Public

- `GET /api/health` → status and database state.
- `GET /api/site` → `{site, revision, publishedAt}`. Published content only.
- `GET /api/site/stream` → Server-Sent Events after publication; no draft data.
- `GET /assets/...` → supplied static files.
- `GET /uploads/...` → uploaded media with immutable randomized filenames.

## Sessions

- `POST /api/auth/login` with `{email,password}` → `{user,csrf}` and an opaque HttpOnly cookie. Rate limited. Only a SHA-256 hash of the session token is stored in MongoDB.
- `GET /api/auth/session` → `{user,csrf}` for a valid session.
- `POST /api/auth/logout` → invalidates the current session.

Authenticated writes include `X-CSRF-Token: <csrf>` and same-origin credentials. CSRF tokens should stay in application memory. The frontend does not store authentication tokens in localStorage.

## Admin

All endpoints require the session cookie. All writes also require the CSRF header and an allowed Origin when Origin is present.

| Method / path | Body / response |
| --- | --- |
| `GET /api/admin/site` | Draft site, `draftVersion`, public `revision`, dates |
| `PUT /api/admin/site` | `{site,expectedVersion}` → validated draft + incremented draftVersion |
| `POST /api/admin/publish` | `{expectedVersion}` → revision and publish date |
| `GET /api/admin/history` | Recent published revision metadata |
| `POST /api/admin/restore` | `{revision,expectedVersion}` → restored draft + new draftVersion |
| `GET /api/admin/export` | Downloadable content JSON with draft and published copies, no credentials |
| `POST /api/admin/password` | `{currentPassword,newPassword}` → invalidates all administrator sessions |
| `GET /api/admin/media` | Uploaded metadata + read-only included asset metadata |
| `POST /api/admin/media` | Multipart field `file`; actual file signature checked; returns media record |
| `PATCH /api/admin/media/:id` | `{archived:boolean}`; reversible, retains public file |

The shared schema is in `shared/schema.js`. It constrains hero numeric ranges, colors, URLs, unique collection IDs, permitted layout tags/attributes and total JSON size. No scripts, event handler attributes or arbitrary HTML execution are accepted.

MongoDB collections: `admins`, `sessions` (TTL expiry), `sites` (single `main` document), `media`. Draft saves use compare-and-swap on `draftVersion`. Publication checks draft version and prior public revision atomically, stores the validated snapshot and appends history. Data is single-site; content changes do not modify credentials or database connection settings.

## Single-switch live Halloween control

`PATCH /api/admin/halloween` requires the admin session, CSRF token and `{enabled:boolean,expectedVersion:number,expectedRevision:number}`. It atomically changes only preset/decor/manual-schedule fields in the published and saved draft copies, increments both versions, keeps a published revision snapshot and notifies public tabs. It never publishes unrelated draft content. On disable, each copy restores its own preceding non-seasonal preset and decoration preference. Global animation and reduced-motion preferences are respected. Annual scheduling is disabled for an explicit manual on/off decision.

`GET /api/admin/site`, publish and Halloween update responses include `halloweenEnabled`, based on the effective published theme. Changes use optimistic version checks; stale updates return 409. Optional `SESSION_COOKIE_NAME` isolates simultaneous local checkouts without changing authentication security.

## Christmas and shared seasonal switching

`PATCH /api/admin/christmas` accepts the same authenticated, CSRF-protected body as `/api/admin/halloween`. Both responses, admin-site loads and publish responses include `halloweenEnabled` and `christmasEnabled`. These are computed from one effective preset, so only one can be true. The shared seasonal update atomically preserves a non-seasonal restore point for both saved draft and published content. Turning either active mode off restores Original/Custom rather than reviving the other holiday. Existing Halloween restore metadata is accepted when it refers to a non-seasonal preset. Both routes retain version checks, snapshot history and theme-only publication.
