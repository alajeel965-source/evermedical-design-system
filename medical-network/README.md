# Medical Network

A professional networking platform for healthcare professionals — connect with
clinicians, discover events, and collaborate. Built with React, TypeScript,
Vite, and Tailwind CSS.

## Features

- 🏠 **Home** — landing page with platform highlights
- 👥 **Network** — searchable directory of medical professionals
- 📅 **Events** — conferences, workshops, and webinars

## Tech stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev) — fast dev server and build
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [React Router](https://reactrouter.com) — client-side routing

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the dev server (HMR)        |
| `npm run build`   | Type-check and build for prod     |
| `npm run preview` | Preview the production build      |
| `npm run lint`    | Run ESLint                        |

## Project structure

```
medical-network/
├─ index.html
├─ src/
│  ├─ main.tsx          # entry point
│  ├─ App.tsx           # routes
│  ├─ components/       # shared UI (Layout)
│  ├─ pages/            # Home, Network, Events
│  └─ data/             # sample data
└─ ...config files
```

## Roadmap

- [ ] Authentication & professional profiles
- [ ] Real backend (Supabase / API)
- [ ] Messaging between professionals
- [ ] Event registration & calendar sync
