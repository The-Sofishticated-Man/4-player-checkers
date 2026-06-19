---
name: checkers
description: Specialized agent for the 4-player checkers game project. Handles code generation, analysis, debugging, and feature implementation across the full-stack monorepo.
argument-hint: A task to implement, question to answer, feature to build, or bug to fix in the 4-player checkers project.
tools: ["vscode", "execute", "read", "agent", "edit", "search", "todo"]
---

# Checkers Game Agent

## Project Overview

This is a **4-player checkers game** built as a real-time multiplayer web application using a monorepo architecture.

### Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, React Router, Socket.io-client, Tailwind CSS 4, @dnd-kit (drag-and-drop)
- **Backend**: Node.js + Express, Socket.io, TypeScript, Nodemon (dev)
- **Architecture**: Monorepo with `client/`, `server/`, and `shared/` folders
- **Dev Environment**: Docker (Compose), cross-env for platform compatibility, TSConfig paths

## Project Structure & Patterns

### Monorepo Organization

- **`client/`** - React frontend with Vite build system
- **`server/`** - Express backend with Socket.io handlers
- **`shared/`** - Game logic, types, and utilities shared between frontend and backend
- **Root**: Docker Compose, README documentation

### Frontend Architecture (`client/src/`)

**State Management**:

- React Context API: `BoardContextProvider`, `SocketProvider`
- `useReducer` hook with `boardReducer` for game state
- Redux-like pattern with `BoardAction` actions

**Key Components**:

- `Board.tsx` - Main game board display
- `BoardGrid.tsx` - Grid layout management
- `Cell.tsx` - Individual board cells
- `Piece.tsx` - Player pieces
- `PlayerCornerCard.tsx` - Player information display
- `SideMenu.tsx` - Game controls and UI
- `DevSandboxPanel.tsx` - Development testing panel (Vite dev mode only)

**Hooks** (in `hooks/`):

- `useBoard()` - Board state management
- `useSocket()` - Socket.io connection and event handling
- `useCreateGame()` - Game creation logic
- `useJoinGame()` - Game joining logic
- `useDragAndDrop()` - @dnd-kit drag-and-drop integration

**Routing** (React Router):

- `/` - Create or join game (`CreateOrJoin.tsx`)
- `/game/:roomId` - Active board page (`BoardPage.tsx`)

**Utilities**:

- `boardActions.ts` - Action creators for game state
- `boardReducer.ts` - State reduction logic
- `boardRenderer.tsx` - Board rendering logic
- `boardOrientation.ts` - Handle player perspective rotation
- `boardValidation.ts` - Client-side move validation
- `playerIdentity.ts` - Player ID/index tracking
- `sideMenuThemes.ts` - UI themes
- `debugUtils.ts` - Development debugging tools

### Backend Architecture (`server/src/`)

**Game Model** (`models/Game.ts`):

- Manages game instance state
- Tracks players, game state, clock
- Handles game lifecycle (start, end, player connections)

**Handlers** (Event-driven Socket.io handlers):

- `roomHandlers.ts` - Room creation, joining, leaving
- `moveHandlers.ts` - Move validation and execution
- `sandboxHandlers.ts` - Development sandbox mode tools

**Utilities** (in `utils/`):

- `initialGameState.ts` - Bootstraps game with 4 players
- `gameClock.ts` - Turn timer logic with increment
- `gameLifecycle.ts` - Game start/end lifecycle
- `gameUtils.ts` - Helper utilities
- `boardExecutionCore.ts` - Move execution logic
- `devSandbox.ts` - Sandbox mode flag (ENV: `CHECKERS_SANDBOX`)
- `sandboxEvents.ts` - Sandbox-only debug events
- `setupMoveHandlers.ts`, `setupRoomHandlers.ts`, `setupSandboxHandlers.ts` - Handler registration

### Shared Logic (`shared/`)

**Game Logic** (in `logic/`):

- `boardTypes.ts` - Core interfaces: `MoveExecutionResult`, `ValidMove`, `CapturedPosition`
- `boardModel.ts` - Board data structure and manipulation
- `boardGeometry.ts` - Board coordinate calculations
- `boardValidation.ts` - Move legality rules
- `boardCaptures.ts` - Capture/jump logic
- `boardExecutionCore.ts` - Move execution
- `boardGameState.ts` - Game state updates
- `boardForfeit.ts` - Forfeit/resignation logic
- `pieceUtils.ts` - Piece manipulation utilities
- `nicknameValidation.ts` - Player nickname validation

**Types** (in `types/`):

- `gameTypes.ts` - Core game types: `BoardState`, `GameState`, `PlayerId`, `PlayerMap`, `PlayerIndex`

## Development Workflows

### Sandbox Mode

Enables testing without 4 players and bypasses strict validation:

```bash
cd server
npm run dev:sandbox          # Sandbox mode enabled
npm run dev:strict           # Strict validation enforced
npm run dev                  # Default (non-strict)
```

**Sandbox Features**:

- Game starts with 1 player
- Move validation and turn ownership bypassed
- Socket event: `debug-set-state` for state manipulation
- Client shows `Dev Sandbox` panel with reset board, force turn, and test scenarios

### Build & Development

```bash
# Client
npm run dev      # Vite dev server with HMR
npm run build    # TypeScript + Vite build
npm run lint     # ESLint check

# Server
npm run dev      # Nodemon auto-reload
npm run build    # TypeScript compilation
npm run start    # Production start
```

## Code Patterns & Conventions

### State Management

- Each file should return only one component, if you need more, create a seperate file
- Game state flows through `gameContext` (client)
- Actions dispatched to `boardReducer` for state updates
- Server sends state updates via Socket.io to keep clients in sync

### Socket.io Communication

- Event-driven architecture with handlers in `server/src/handlers/`
- Room-based game isolation
- Real-time state synchronization between server and connected clients

### Game Flow

1. **Connect** → Player joins game via Socket.io
2. **Create/Join Room** → Game instance created or joined
3. **Wait for Players** → Game waits for 4 players (or 1 in sandbox)
4. **Start Game** → Initial board state created
5. **Move Execution** → Validate, execute move, update board, change turn
6. **Turn Management** → Game clock runs per player
7. **Capture/Forfeit** → Handle captures or player resignation
8. **End Game** → Determine winner or handle forfeit

### Type Safety

- Strict TypeScript across frontend, backend, and shared logic
- Shared types in `shared/types/gameTypes.ts` for consistency
- Player tracking: `PlayerId`, `PlayerIndex`, `PlayerMap`

### Drag-and-Drop

- Uses `@dnd-kit/core` for piece dragging
- Integrated in `useDragAndDrop()` hook
- Client-side move validation before server submission

## When to Use This Agent

✅ Generate code for the checkers project  
✅ Debug multiplayer synchronization issues  
✅ Implement new game features (pieces, rules, turns)  
✅ Optimize board rendering or state management  
✅ Enhance Socket.io event handling  
✅ Add/fix game validation logic  
✅ Improve dev sandbox tools  
✅ Refactor shared game logic

## Key Considerations

- **Multiplayer Sync**: Keep server state authoritative
- **Turn Management**: Use game clock for fairness
- **Client Validation**: Mirror server rules for UX responsiveness
- **Sandbox Mode**: Critical for fast iteration and testing
- **Type Consistency**: Shared types must stay synchronized
- **Performance**: Board rendering optimizations for smooth gameplay
- **Docker Compatibility**: Changes must work in containerized environment
