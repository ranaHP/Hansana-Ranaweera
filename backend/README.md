# Backend

Node.js/Express API, MongoDB persistence, authentication, media uploads and production frontend serving. Uses Mongoose, HttpOnly sessions, salted scrypt passwords, CSRF protection and validated schemas.

Install dependencies once from the repository root with `npm ci`. Copy root `.env.example` to `.env` and set `MONGODB_URI`. Alternatively use private `backend/.env`, which takes precedence over root `.env`. Both private files are ignored by Git.

```sh
# From repository root
npm run admin:create
npm run dev:backend
# Or from this folder
npm run admin:create
npm run dev
```

Defaults to http://127.0.0.1:4000. Backend `npm run dev` uses Node watch mode; `npm start` runs without watching. Run the frontend separately on port 5173 during development. Build the frontend before serving it from this backend in production.

`index.js` starts the application; `app.js` implements API routes; `store.js` defines Mongo models, drafts, publication and history; `security.js` handles authentication and CSRF. Shared schemas are in `../shared`, seed content in `../seed`, uploads in ignored `backend/uploads`.

See `../API.md` for routes and `../README.md` for setup, backups, Docker and HTTPS configuration. No production administrator is pre-created; credentials are not checked into Git.
