# Habit Tracker — Frontend (React + Vite)

## Setup

```bash
npm install
cp .env.example .env   # points VITE_API_URL at the backend
npm run dev
```

Opens on `http://localhost:5173`.

## Verification (run locally — this sandbox has no network access)

```bash
npm run lint
npx tsc -b --noEmit
npm run build
```

## Notes

- UI primitives in `src/components/ui/` are hand-written, Tailwind +
  Radix components matching shadcn/ui's API and styling conventions (same
  props/variants you'd get from `npx shadcn add button`, etc.) — this
  sandbox couldn't reach the shadcn CLI/registry (no network), so they're
  authored directly rather than fetched. They're drop-in compatible if you
  later run `npx shadcn add <component>` to replace any of them.
- Sheet/Drawer/Popover/Tooltip/Dropdown from the original component list
  were consolidated into the `Dialog` primitive for this MVP to keep scope
  tight — swap in dedicated Radix Sheet/Popover components later if you
  want distinct slide-up vs. centered-modal motion.
- `useWhatsAppStatus` opens a Socket.IO connection to `${VITE_API_URL}/whatsapp`
  authenticated via the same access-token cookie used for REST calls, and
  merges pushed `status` events into the React Query cache — no polling.
- Optimistic habit/subtask completion toggling lives in `use-dashboard.ts`,
  with rollback on a failed mutation.
