# Casino Jackpot

A full-stack slot machine game built with React and Node.js. The house always wins!

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Testing**: Vitest, React Testing Library, Supertest
- **Architecture**: Mono-repo with npm workspaces

## Project Structure

```
casino/
├── shared/          # Shared TypeScript types and constants
├── server/          # Express API server
│   ├── services/    # Session store + slot machine logic
│   ├── routes/      # REST endpoints
│   └── __tests__/   # Unit + integration tests
└── client/          # React frontend
    ├── components/  # UI components (SlotMachine, Reel, etc.)
    ├── hooks/       # useSlotMachine game state hook
    ├── api/         # API client functions
    └── __tests__/   # Component tests
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the server (port 3001)
npm run dev:server

# In a separate terminal, start the client (port 5173)
npm run dev:client

# Run all tests
npm test
```

## Game Rules

- Start with **10 credits**
- Each roll costs **1 credit**
- Match all 3 symbols to win:
  - **C** (Cherry) = 10 credits
  - **L** (Lemon) = 20 credits
  - **O** (Orange) = 30 credits
  - **W** (Watermelon) = 40 credits
- Cash out anytime to keep your credits

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session` | Create new game session |
| POST | `/api/session/:id/roll` | Roll the slot machine |
| POST | `/api/session/:id/cashout` | Cash out and end session |

## The House Edge

The server implements a re-roll mechanism to ensure the house has an advantage:

- **Credits < 40**: Fair, truly random rolls
- **Credits 40-60**: 30% chance to re-roll winning results
- **Credits > 60**: 60% chance to re-roll winning results

When a re-roll is triggered, the server generates a completely new roll — which may or may not be a win. This makes it progressively harder for players to accumulate large credit balances.

## Development Journey

### Step 1: Architecture & Planning

Chose a mono-repo structure with npm workspaces to share types between server and client. This ensures type safety across the full stack without manual synchronization.

Key decisions:
- **In-memory session store** — suitable for the assignment scope, avoids external dependencies
- **Shared types package** — single source of truth for API contracts and game constants
- **`useReducer` hook** — cleaner than `useState` for managing the multi-state game flow (spinning, revealing, credits, messages)

### Step 2: Shared Types

Created `@casino/shared` with all types, constants, and game configuration values. Both server and client depend on this package, preventing drift between API request/response shapes.

### Step 3: Server Implementation

Built three layers:
1. **SessionStore** — in-memory `Map<string, Session>` with CRUD operations
2. **SlotMachine** — pure functions for roll generation, win detection, reward lookup, and the cheat/re-roll mechanism
3. **Routes** — Express handlers that validate input, orchestrate the services, and return typed responses

The cheat logic is cleanly separated: `rollWithCheat(credits)` encapsulates the entire decision tree, making it easy to test in isolation.

### Step 4: Server Tests (30 tests)

- **sessionStore.test.ts** (11 tests) — CRUD operations, edge cases (nonexistent/closed sessions)
- **slotMachine.test.ts** (10 tests) — roll generation, win detection, rewards, cheat logic with mocked `Math.random`
- **routes.test.ts** (9 tests) — integration tests via Supertest covering happy paths and error cases

### Step 5: Client Implementation

Built the UI with a component hierarchy:
- `SlotMachine` — orchestrates the game screen
- `Reel` — individual reel block with spinning animation
- `CreditDisplay` — shows current credit balance
- `CashOutButton` — triggers cash out

The `useSlotMachine` hook manages all game state via `useReducer` and handles the staggered reveal timing (1s, 2s, 3s delays using `setTimeout`).

### Step 6: Client Tests (6 tests)

Tested the full component integration with mocked API calls:
- Initial render shows start screen
- Session creation and game UI
- Sequential reel reveal with fake timers
- Win/loss message display
- Cash out flow

### Challenges & Solutions

1. **Fake timers + async**: `vi.useFakeTimers()` prevents promises from resolving. Solved by using `act(async () => ...)` to wrap both async operations and timer advances, and only enabling fake timers in tests that need them.

2. **Math.random mock precision**: Mocking `Math.random` for slot machine tests required calculating exact index boundaries (`floor(value * 4)`). Initial mock values were off — fixed by documenting the mapping inline.

3. **Credit deduction ordering**: The roll cost is deducted before the roll, so the cheat logic sees the post-deduction credit count. This is intentional — it matches the "cost to play" model.
