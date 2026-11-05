# Hansana Ranaweera — Portfolio + Admin

A complete React, Express/Node.js and MongoDB portfolio project. The existing Systems Garden design, portraits, animated tech icons, original completion images and interactive Three.js world are retained. The public website reads published content from MongoDB. `/admin` is a separate authenticated React dashboard.


**Start here: [complete configuration guide](SETUP.md).** This branch adds an immediate, one-click Halloween, Christmas and Night controls to the admin.

## Repository structure

One repository, separate npm workspaces:

- `frontend/` — React, Vite, public portfolio, admin dashboard and original visual assets.
- `backend/` — Node.js, Express, MongoDB, sessions, uploads and publishing API.
- `shared/` — validated content schema and theme palettes used by both.

Install once from the repository root with `npm ci`. You can start each app independently:

```sh
# Terminal 1 (requires MongoDB configured in root .env or backend/.env)
npm run dev:backend
# Terminal 2
npm run dev:frontend
```

For one-command development use `npm run dev`; for a temporary real-Mongo demo use `npm run demo`. Production uses `npm run build` then `npm start`. Build output and private runtime files are excluded from Git.

## Start the local demo

Install Node.js 22.12 or newer. Extract this folder, open a terminal here, then run:

```sh
npm ci
npm run demo
```

On Windows you can also double-click `START-DEMO.cmd`.

- Website: http://127.0.0.1:5173/
- Admin: http://127.0.0.1:5173/admin
- Private temporary login: `.local/demo-access.json`, generated at startup. Open the file on your computer and use its email/password.
- The first run downloads an official MongoDB binary through `mongodb-memory-server`; internet access is needed for this download and npm installation.
- This demo uses a **real temporary MongoDB instance**. Its content and credentials reset when stopped. Use the persistent setup below for real editing. Uploaded files are stored in `backend/uploads`, independent of the temporary database.

No shared password, account, database secret or private demo credential is included in the downloadable project.

## Persistent MongoDB setup

Use a local MongoDB Community instance or a MongoDB Atlas connection string.

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, for example `mongodb://127.0.0.1:27017/hansana_portfolio`.
3. Run `npm ci`.
4. Run `npm run admin:create` and enter an email and a password containing 12+ characters, a letter and a number. The CLI explicitly indicates that password input is visible. For automation it also accepts temporary `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables; clear these afterward.
5. Run `npm run dev` for development, or `npm run build` followed by `npm start` for the built application.

Development uses React/Vite on port 5173 with API proxying to Express on 4000. After running the build, the application serves both website and admin on http://127.0.0.1:4000. MongoDB is seeded automatically only when the site document does not exist. `npm run seed` is safe to repeat and does not overwrite existing edits.

## Admin workflow

1. Sign in at `/admin`.
2. Edit profile, links, résumé, projects, lab, experience, education, skills, coursework, articles, recognition, navigation or page text.
3. **Save draft** writes to MongoDB without changing the public website.
4. **Preview** opens the saved draft in an authenticated window. **Live preview** embeds it beside the editor; refreshes follow successful saves. Unsaved values are not shown there.
5. **Publish website** saves outstanding changes and publishes the draft. Open public tabs refresh their content through Server-Sent Events.

Concurrent editors are protected by a draft version check. If another window saves first, reload your saved draft using Discard changes before continuing. Unsaved edits trigger a navigation warning. Published snapshots can be restored into the draft from History & backups. Restore never automatically publishes. The last 12 published revisions are retained.

## Everything you can manage

| Editor | Controls |
| --- | --- |
| Profile & links | Name, location, role, employer, dates, email, social links, résumé, gallery portrait |
| Hero composition | Portrait/fallback, min height, padding, name size, image scale, horizontal/vertical position, crop insets, independent mobile sizing, planning visibility, icons, background image |
| Floating tech icons | Icon file, label, x/y position, tilt, visibility and ordering; gentle motion follows accessibility preference |
| Themes & appearance | Original, Halloween, Christmas, custom colors, fonts, spacing, corner radius, animation/decor toggles and background image |
| Annual schedule | Timezone and ordered date rules with year-wrap support; first matching enabled rule wins |
| Projects & lab | Add/edit/remove/reorder, status, description, tools, case-study details, diagram captions, image and project link |
| Experience / education / skills | Add/edit/remove/reorder all entries and descriptions |
| Credentials | Issuer logo, course title, evidence image, verification link, year, group and evidence description |
| Notes / recognition / method | Article paragraphs, awards and engineering method steps |
| Navigation & sections | Link labels/destinations, visibility, section order; adding a brand-new section also requires its layout in Advanced layout |
| All page text / interface labels | All original static headings, paragraphs, SVG planning labels, button text, dialog/search labels and captions |
| 3D world | Enable, pause, initial scene, theme matching or individual material/background colors; three editable scene captions |
| Media library | Upload real images or PDFs, copy URLs or choose directly from image fields, reversible archive |
| Search & sharing | Browser title, description, canonical URL, social preview image |
| Advanced layout | Safe React document tree for uncommon structural edits; scripts, inline event handlers and unsafe URLs rejected |
| History & backups | Export/import content JSON and restore published snapshots |
| Account | Change password and invalidate all sessions |

The 3D objects themselves are authored in `frontend/src/world.js`; scene geometry changes require code. Admin controls their palette, scene, availability, motion and captions. Adding new React behaviors or wholly new layouts also requires development.

Halloween and Christmas are fully usable manual themes. Optional annual scheduling is off by default. Default rules are October 20–November 2 and December 1–31, using Asia/Riyadh. Original appearance is the initial theme. Custom mode uses the full editable palette. Reduced motion disables ambient animation regardless of the chosen theme.

## Media, evidence and content integrity

- Uploads accept PNG, JPEG, WebP, AVIF, GIF and PDF, maximum 10 MB, validated by actual file signature. Uploaded SVG is not accepted. Included trusted SVG logos remain available.
- Archive hides an uploaded file from selection without breaking existing public URLs. Original included assets are read-only.
- Hero uses an AI-assisted sleeve extension. The original supplied portrait is preserved in the gallery and assets.
- Supplied coursework screenshots are completion evidence, not fabricated individual certificate PDFs. No verification URL is invented.
- Employer logos and coursework issuer logos do not imply endorsement. See `ASSET-NOTES.md` and included third-party licenses.
- Back up MongoDB **and** `backend/uploads`. Content JSON only contains media URLs, not binary files, accounts or sessions.

## Docker option

Requires Docker with Compose:

```sh
docker compose up --build -d
docker compose exec app npm run admin:create
```

Open http://127.0.0.1:4000. Named volumes retain MongoDB data and uploads across restarts. The supplied Compose file binds only to localhost and does not expose MongoDB. Docker files are provided but were not executed in this environment.

For a public deployment use a persistent MongoDB service and persistent upload storage, HTTPS, your actual origin in `ALLOWED_ORIGINS`, `COOKIE_SECURE=true`, `NODE_ENV=production`, and bind `HOST` appropriately. Set `TRUST_PROXY=true` only behind a trusted single reverse proxy. Keep `.env` private. Admin cookies are HttpOnly and SameSite=Strict; writes require a session-specific CSRF token and allowed Origin; passwords use salted scrypt. There is no public registration or email-based password reset.

## Commands and project map

```text
npm run demo          Temporary real-Mongo local demo + Vite
npm run dev           Vite + Express using .env MongoDB
npm run build         Production React build -> frontend/dist
npm start             Express + built React client
npm run admin:create  Create an admin, no default production credentials
npm run seed          Initialize only if site is absent
npm test              Real MongoDB integration and theme tests
```

```text
frontend/src/Portfolio.jsx       React public website, document renderer and interactions
frontend/src/world.js            Lazy-loaded Three.js world
frontend/src/admin/              React admin, forms and API client
frontend/src/styles/             Original design plus CMS/theming overrides
frontend/public/assets/          Portraits, résumé, logos, completion screenshots
frontend/dist/                 Generated production build (gitignored)
backend/app.js                  Express API, uploads and static serving
backend/store.js                Mongo models, versioned drafts, publishing and history
backend/security.js             Passwords, sessions, CSRF and origin checks
backend/index.js                Environment configuration and application lifecycle
shared/schema.js               Shared validated content/document model
shared/themes.js               Theme palettes and annual scheduling
seed/site.json                 Complete editable initial content
tests/cms.test.js              Integration tests
```

The document tree is rendered with React elements, not an iframe or injected HTML. The admin preview iframe is only a preview of the same React application. Draft and published documents are independently stored in MongoDB. There is one portfolio and one admin role; use the admin creation command for additional trusted administrators. No analytics, tracking, cloud dependency or external messaging service is added.

Validation performed: production build; MongoDB integration, theme and mode test groups; browser checks for sign-in, saved draft preview, hero controls, theme publish/restore, search, credentials and responsive layout. See `VERIFICATION.md` for exact results and limitations.

## Halloween atmosphere

Use the **Halloween mode** switch in Admin to apply Halloween immediately. It updates only the live theme settings; unrelated draft edits stay private. Turning it off restores the previous non-seasonal preset. Manual switching disables the annual schedule; it can be re-enabled under Themes & appearance. The theme includes a moonlit SVG landscape, floating bats, lantern pumpkins, drifting violet/amber light, fireflies and themed project cards. Animations and seasonal decorations can be disabled independently in the existing Appearance controls; system reduced-motion preferences are respected.

For an authenticated draft preview use `/?preview=1&mode=immersive&theme=halloween`. Theme query overrides apply only to draft previews. Public URLs always follow the published admin settings, including old links containing `theme=halloween`.

### Interactive Halloween edition

Hover over the portrait's face for its AI-assisted monster alternate; leaving the face restores the normal photo. On touch devices tap the face to toggle. Keyboard focus also reveals it, and Escape restores the original. The hotspot is measured against the actual portrait and follows admin sizing/position changes.

Page-wide bats, gently dimming edge lanterns, corner webs and hanging spiders are decorative and do not intercept clicks. Pause ambience freezes the seasonal motion independently of the 3D world. The Appearance animation/decor controls and system reduced-motion preferences remain supported. Smaller screens use fewer bats and lanterns. Quick mode does not load the monster portrait.

## Tech-Santa Christmas edition

The Christmas switch applies the forest-green/gold palette, your AI-assisted tech-Santa portrait, illustrated gift boxes, reindeer, snowfall, evergreen scenery and softly glowing lights immediately. Halloween and Christmas are mutually exclusive. Off restores the previous Original/Custom preset; neither toggle publishes unrelated draft content. The Christmas Pause ambience button freezes festive motion; the Appearance animation/decor preferences and system reduced-motion settings remain respected.

## After Hours: interactive night mode

Admin has a **Night mode** switch alongside Halloween and Christmas. Turning on any of these three experiences turns the others off, and preserves unrelated drafts. Turning it off restores your previous Original/Custom theme.

Night mode adds an illustrated evening street, switchable streetlight and wall lamp, warm pools of light, a pointer-controlled torch, revealed brick textures and three hidden ghosts. Move the mouse into dark areas or tap on touch devices to aim the torch. Project illustrations brighten when explored with the torch. Essential text and navigation stay readable.

The Night controls include Torch (shortcut **F**), **Light the street** (shortcut **L**, reveals the hidden scenery and ghosts), Dusk → Midnight depth, and pause/resume ambience. Click the lamp heads to switch their light pools. Mobile controls collapse into a small bar and open with the + button. Keyboard shortcuts do not intercept browser Ctrl/Command shortcuts or input fields. System reduced-motion and admin animation/decor preferences are respected. These visitor controls are temporary; the global Night mode is saved through the admin.
