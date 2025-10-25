# Repository Guidelines

## Project Structure & Module Organization
Repository layers are split for clarity. The Vue 3 + Vite client lives in `frontend/`; reusable UI blocks sit in `frontend/src/components/`, and admin dashboards reside in `frontend/src/views/admin/`. Static assets publish from `frontend/public/`. Serverless logic is in `api/`, where `index.js` composes Express middleware defined under `api/routes/`. Local state is stored in `api/database/nav.db`, and uploads collect in `api/uploads/`. Delivery tooling is tracked by `deploy.sh`, `deploy.bat`, and `.github/workflows/deploy.yml`, while environment templates stay in `.env.example` at the root and within `frontend/.env.example`.

## Build, Test, and Development Commands
Install backend dependencies at the root via `npm install`, then change into `frontend/` and repeat for client packages. Launch the frontend with `npm run dev` (served at `http://localhost:5173`). Emulate the API using `vercel dev --cwd api` or mount the Express app in a lightweight Node process. Produce optimized assets through `npm run build`. Vercel’s CI path runs `vercel build`; you can mirror it locally with the same command, supplying the appropriate token. Execute `npm test` inside `api/` to run Node’s test runner against `tests/**/*.spec.js`.

## Coding Style & Naming Conventions
Use 2-space indentation, single quotes, and trailing semicolons for JavaScript and Vue files. Components follow PascalCase (for example, `CardGrid.vue`), while route and utility modules prefer camelCase filenames. Keep functions focused on a single responsibility; factor shared helpers into `frontend/src/utils/` or dedicated modules inside `api/routes/` to avoid duplication. Declare magic numbers and configuration constants near the top of the owning file.

## Testing Guidelines
Backend tests rely on the built-in Node runner. Add specs beneath `api/tests/` using the `*.spec.js` suffix and execute them with `npm test`. The included `health.spec.js` illustrates how to bootstrap the Express app and assert the `/health` contract—mirror that pattern when covering additional endpoints. For frontend work, scaffold vitest + @vue/test-utils, co-locate tests under `frontend/src/__tests__/`, and run them before submitting changes. Every pull request should also complete `npm run build` and manual smoke checks of key routes.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (e.g., `feat: add card import api`) to describe intent succinctly. Summaries in each pull request must list change highlights, linked issues or tasks, validation steps, and UI evidence (screenshots or clips) when appropriate. Ensure configuration updates come with documentation changes. Only merge into `main` or `master` after CI passes and, when available, attach the Vercel preview URL.

## Security & Configuration Tips
Manage secrets through Vercel project variables and keep `.env`, `api/database/nav.db`, and generated upload artifacts out of version control. Extend `.env.example` whenever new configuration keys appear. Note any new third-party integrations or elevated permissions in pull request descriptions so reviewers can assess operational impact.
