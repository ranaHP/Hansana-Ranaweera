# Frontend

React public portfolio and authenticated admin interface. Retains the original website's Segoe UI/Georgia typography and original colors.

Install dependencies once from the repository root with `npm ci`.

```sh
# From repository root
npm run dev:frontend
# Or from this folder
npm run dev
```

Vite serves http://127.0.0.1:5173 and proxies `/api` and `/uploads` to the backend on port 4000. Start the backend in a second terminal, or run root `npm run dev` for both. Root `npm run demo` supplies a temporary real MongoDB database and both processes.

`npm run build` here creates `frontend/dist`. The backend serves that production build and handles `/admin` as a React route. For separately hosted services, configure your frontend host to proxy `/api` and `/uploads` to the backend on the same public origin; authentication uses same-origin HttpOnly cookies. Configure allowed origins and HTTPS cookie settings on the backend.

`src/Portfolio.jsx` renders published content using safe React elements. `src/admin` contains the admin. `src/world.js` is the lazy-loaded Three.js scene. `public/assets` holds the supplied portraits, resume, logos and completion evidence. Shared schemas and themes are in `../shared`.
