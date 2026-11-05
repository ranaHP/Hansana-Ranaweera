# Complete setup — React frontend, Node backend, MongoDB and admin

Branch: **`feature/interactive-night-world`**. This guide uses Node directly; Docker is optional and is not required for any step below.

## 1. Prerequisites and download

- Git and Node.js **22.12 or newer** (npm is included).
- For permanent data, MongoDB Community running locally or a MongoDB Atlas cluster.
- Run commands from the repository root unless a step says otherwise.

```powershell
git clone --branch feature/interactive-night-world https://github.com/ranaHP/Hansana-Ranaweera.git
cd Hansana-Ranaweera
npm ci
```

For an existing clone:

```powershell
git fetch origin
git switch feature/interactive-night-world
git pull --ff-only
npm ci
```

`frontend/` is React/Vite, `backend/` is Express/Mongoose, and `shared/` contains the schema and theme palettes. One root lockfile installs all three workspaces.

## 2. Fastest way to try everything

```powershell
npm run demo
```

This starts a real temporary MongoDB instance, Express on port 4000 and React on port 5173. The first run may download the MongoDB binary; allow time for that download.

- Website: http://127.0.0.1:5173/
- Admin: http://127.0.0.1:5173/admin
- Private generated login: **`.local/demo-access.json`**. Open that file on your own computer and use its email/password.
- Stop with Ctrl+C. The demo database and login reset on restart. Use the permanent setup below to keep your edits.

No Docker, API key, shared login or existing MongoDB installation is required for the demo. Port conflicts mean another instance is already running; stop that instance or use the alternative-port instructions at the end.

## 3. Configure a permanent database

### Local MongoDB

Install MongoDB Community using its official installer and start its service. The standard local connection is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/hansana_portfolio
```

### MongoDB Atlas

1. Create an Atlas project and cluster.
2. Create a **database user** with read/write access to `hansana_portfolio`. This is different from your Atlas login and the website admin.
3. In Network Access, allow your computer's public IP. Add the production server's outbound address when hosting.
4. Choose Connect → Drivers → Node.js and copy the connection URI.
5. Replace the username/password and include `hansana_portfolio` as the database name. Percent-encode special characters in the URI credentials.

```dotenv
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/hansana_portfolio?retryWrites=true&w=majority
```

See the [official Atlas connection guide](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/). You do not need to manually create collections; the initialization step below creates the database records and indexes.

## 4. Create your environment file

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your database URI:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/hansana_portfolio
PORT=4000
HOST=127.0.0.1
NODE_ENV=development
ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:4000,http://localhost:4000
COOKIE_SECURE=false
TRUST_PROXY=false
```

The backend loads root `.env` regardless of which folder you start it from. An optional `backend/.env` takes priority. Process environment variables take priority over both files. Private environment files, demo credentials, uploaded media and dependencies are ignored by Git. Never put the database URI into frontend `VITE_*` variables.

## 5. Initialize content and create an admin

```powershell
npm run seed
npm run admin:create
```

The seed command imports `seed/site.json` only when the website is absent. It preserves existing content on subsequent runs. Enter your own email and a password with at least 12 characters, a letter and a number. The interactive CLI indicates that password entry is visible; credentials are stored as a salted scrypt hash in MongoDB.

There is no default production administrator. An existing email is rejected; change an existing account's password inside Admin → Account.

## 6. Connect and start frontend + backend

Start both with one command:

```powershell
npm run dev
```

Or use two terminals, both at the repository root:

```powershell
# Terminal 1
npm run dev:backend
```

```powershell
# Terminal 2
npm run dev:frontend
```

| Component | Local URL |
| --- | --- |
| Website | http://127.0.0.1:5173/ |
| Admin | http://127.0.0.1:5173/admin |
| Backend health | http://127.0.0.1:4000/api/health |

React calls relative `/api/...` URLs. Vite proxies `/api` and `/uploads` to Express on port 4000. Express connects to MongoDB using `MONGODB_URI`. No additional frontend connection string is needed. An uploaded photo travels from the admin to Express; its metadata is stored in MongoDB and the file in `backend/uploads`.

## 7. Use the seasonal toggles

1. Sign in to `/admin`.
2. Find **Halloween mode** and **Christmas mode** near the top of the editor. Both are available on every admin page.
3. Switch **Halloween On** for the monster portrait, bats, pumpkins, spiders and webs, or **Christmas On** for your tech-Santa portrait, gifts, reindeer, snow and festive lights. Turning one on automatically turns the other off.
4. Switch the active season **Off** to restore the preceding normal theme (Original or Custom). Switching between the two holidays retains this normal-theme restore point, so they cannot cycle back into each other.

**No Save or Publish click is required for this switch.** The server updates only live theme settings and the corresponding saved draft settings. Other saved or unsaved draft content remains private. The animation preference is preserved; reduced-motion remains respected. Open public tabs receive the publication event and refresh their content.

Manual switching disables automatic annual scheduling, so a date rule cannot turn a holiday back on after you explicitly turn it off. Re-enable the schedule under Themes & appearance when desired. Advanced theme cards continue to use the normal draft → preview → publish workflow.

Public URLs always follow the admin setting. An old public link with `theme=halloween` cannot force Halloween back on. Signed-in draft previews can still use `/?preview=1&theme=halloween` without changing the public site.

## 8. Build and run the production client locally

```powershell
npm run build
npm start
```

Open http://127.0.0.1:4000/ and http://127.0.0.1:4000/admin. Express serves the built React files and API under one origin. Keep `COOKIE_SECURE=false` for this local HTTP check. The generated `frontend/dist` folder is rebuilt locally and is not committed to Git.

For a real HTTPS server, set `NODE_ENV=production`, `COOKIE_SECURE=true`, `ALLOWED_ORIGINS` to the actual website origin and `HOST=0.0.0.0` when the host requires it. Set `TRUST_PROXY=true` only behind a trusted single reverse proxy. Keep MongoDB and `backend/uploads` persistent and backed up. On platforms with multiple instances, use shared upload storage and shared publish notifications or polling.

Vercel-specific limitation: this version still writes uploads to local disk. Move uploads to durable object storage before using ephemeral/serverless hosting for the full admin experience. The application is verified locally; this branch does not claim a completed Vercel deployment.

## 9. Verify and maintain

```powershell
npm test
npm run check:assets
npm run build
npm run verify:start
```

Tests use their own temporary MongoDB; they do not alter your configured production database. `verify:start` also starts an isolated database and checks the production entry point, built assets and admin route.

- Back up MongoDB **and** `backend/uploads`.
- Admin → History & backups exports content JSON, which contains media URLs rather than the media files themselves.
- Publishing retains the latest 12 published snapshots; restore loads one into the draft for review.
- Save a draft before a browser refresh. A conflict error means another editor changed its version: preserve your local text, then reload the saved draft before retrying.

## Alternative ports for a second checkout

These PowerShell variables apply to this terminal only:

```powershell
$env:PORT="4001"
$env:FRONTEND_PORT="5174"
$env:ALLOWED_ORIGINS="http://127.0.0.1:5174,http://localhost:5174,http://127.0.0.1:4001,http://localhost:4001"
$env:SESSION_COOKIE_NAME="portfolio.branch.sid"
npm run demo
```

The frontend proxy follows `PORT`; `BACKEND_URL` can override it if needed. The distinct cookie name avoids replacing the login cookie of another local checkout. The generated `.local/demo-access.json` lists the actual preview URLs. For ordinary use, open a fresh terminal and use the default ports above.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Database connection fails | Start MongoDB or check the Atlas URI, database user, encoded password and IP access list. |
| Demo takes time on first start | Let the MongoDB binary finish downloading; subsequent runs can reuse it. |
| Address/port already in use | Stop the previous instance or use the alternative ports above. |
| Admin login fails | Use credentials created against this exact database; demo credentials are different and temporary. |
| Login works locally but not on HTTP | Keep `COOKIE_SECURE=false` for local HTTP. Use true only with HTTPS. |
| Request origin rejected | Match the complete browser origin, including scheme and port, in `ALLOWED_ORIGINS`. |
| Admin says version conflict | Reload the saved draft after preserving your local changes. |
| Halloween will not switch off | Open the normal public URL; public query overrides are ignored on this branch. Ensure both frontend and backend run this branch. |
| Missing uploaded image after deployment | Restore the upload directory or use persistent/object storage; content JSON alone does not include images. |

## Tech-Santa Christmas edition

The Christmas switch applies the forest-green/gold palette, your AI-assisted tech-Santa portrait, illustrated gift boxes, reindeer, snowfall, evergreen scenery and softly glowing lights immediately. Halloween and Christmas are mutually exclusive. Off restores the previous Original/Custom preset; neither toggle publishes unrelated draft content. The Christmas Pause ambience button freezes festive motion; the Appearance animation/decor preferences and system reduced-motion settings remain respected.

## After Hours: interactive night mode

Admin has a **Night mode** switch alongside Halloween and Christmas. Turning on any of these three experiences turns the others off, and preserves unrelated drafts. Turning it off restores your previous Original/Custom theme.

Night mode uses a fixed dusk preset with the torch on and the scene fully illuminated. Warm wall lamps light the hero and certificate archive. Ghosts drift across the page and rise behind hovered certificate cards. Certificates remain readable without aiming the torch.

The floating Night controls and streetlights have been removed. Use the header Light/Dark button to switch locally between the original light palette and After Hours; this preference survives a refresh without changing the published admin settings. System reduced-motion and admin animation/decor preferences are respected.
