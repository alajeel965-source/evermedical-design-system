# EverMedical Design System

Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui.

## Frontend design tooling (shadcn MCP)

This repo ships a project-scoped MCP server for frontend/UI work in `.mcp.json`.
It exposes the [shadcn MCP server](https://ui.shadcn.com/docs/mcp), which lets
Claude Code browse the shadcn registry, view component source/demos, and add
components directly into `src/components/ui`.

- Config: `.mcp.json` (auto-loaded by Claude Code; approve the `shadcn` server
  when prompted).
- Component config: `components.json` (style: default, baseColor: slate, TSX,
  CSS variables, path aliases via `@/`).

Add a component with the CLI (or via the MCP tools):

```bash
npx shadcn@latest add <component>
```

## Layout

- `src/components/ui` — shadcn/ui primitives
- `src/components` — app components
- `src/pages` — routed pages (react-router-dom)
- `src/lib` — utils (`cn`, etc.)
- `src/hooks` — shared hooks
- `src/integrations` — Supabase client + generated types

## Commands

- `npm run dev` — dev server (Vite)
- `npm run build` — production build
- `npm run lint` — ESLint
