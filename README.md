# 4 Player Checkers

## Web Game

## Sandbox mechanics testing

You can enable a server-side sandbox mode that lets you test mechanics without
waiting for 4 players and without strict move validation.

### Quick start

```powershell
cd server
npm run dev:sandbox
```

### Strict mode

```powershell
cd server
npm run dev:strict
```

In sandbox mode:

- game starts with 1 connected player
- move validation and turn ownership checks are bypassed on the server
- a dev-only `debug-set-state` socket event is available

The client also shows a `Dev Sandbox` panel in Vite dev mode on the board page
with quick actions to reset the board, force turn, and load test scenarios.
