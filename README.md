# Casino Jackpot

A full-stack slot machine game built with React and Node.js. The house always wins!

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Material-UI, MobX
- **Backend**: Node.js, Express, TypeScript, TypeORM, Better-SQLite3
- **Testing**: Vitest, React Testing Library, Supertest
- **Architecture**: Mono-repo with npm workspaces
- **Data Validation**: Zod schemas for request/response validation

## Project Structure

```
casino/
├── shared/                    # Shared TypeScript types and constants
│   ├── types.ts              # TypeScript interfaces
│   ├── schemas.ts            # Zod validation schemas
│   └── constants.ts          # Game constants (symbols, reel count)
├── server/                    # Express API server
│   ├── services/             # Business logic layer
│   │   ├── game.service.ts           # Slot machine roll logic
│   │   ├── database.service.ts       # TypeORM data source
│   │   └── gameHistoryRepository.service.ts  # Database operations
│   ├── routers/              # REST API routes
│   │   └── game.router.ts    # Game endpoints
│   ├── middlewares/          # Express middlewares
│   │   ├── session.middleware.ts         # Session management
│   │   ├── requestValidation.middleware.ts  # Zod request validation
│   │   ├── responseValidation.middleware.ts # Zod response validation
│   │   └── error.middleware.ts           # Error handling
│   ├── entities/             # TypeORM entities
│   │   └── gameHistory.entity.ts  # Game history schema
│   ├── errors/               # Custom error classes
│   └── __tests__/            # Unit + integration tests
└── client/                    # React frontend
    ├── components/           # UI components
    │   ├── Game.tsx          # Main game orchestrator
    │   ├── StartGame.tsx     # Start screen
    │   ├── Reel.tsx          # Individual reel display
    │   ├── ReelStrip.tsx     # Animated reel strip
    │   ├── Header.tsx        # App header
    │   └── Footer.tsx        # App footer
    ├── stores/               # MobX state management
    │   ├── game.store.ts     # Game state
    │   └── error.store.ts    # Error handling state
    ├── services/             # API client
    │   └── api.service.ts    # Axios API calls
    ├── hooks/                # Custom React hooks
    │   ├── useReelReveal.hook.ts   # Staggered reveal animation
    │   └── useSpinAnimation.hook.ts # Reel spinning animation
    └── __tests__/            # Component tests
```

## Key Features

- ✅ **Full Type Safety** — End-to-end TypeScript with shared types
- ✅ **Runtime Validation** — Zod schemas for request/response validation
- ✅ **Session Management** — Cookie-based sessions for game state persistence
- ✅ **Database Persistence** — SQLite database for game history
- ✅ **Reactive State** — MobX for efficient state management
- ✅ **Smooth Animations** — Sequential reel reveals with custom hooks
- ✅ **Error Handling** — Custom error classes with centralized middleware
- ✅ **Testing** — Comprehensive unit and integration tests
- ✅ **Configuration** — Environment variable support for all game parameters

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Development

```bash
# Install dependencies for all workspaces
npm install

# Start the server (port 3001)
npm run dev:server

# In a separate terminal, start the client (port 5173)
npm run dev:client

# Open http://localhost:5173 in your browser

# Run all tests
npm test

# Run linting
npm run lint
```

### Production Build

```bash
# Build all packages
npm run build

# Start production server
cd server && npm start
```

## Game Rules

- Start with **10 credits** (configurable via `INITIAL_CREDITS` env var)
- Each roll costs **1 credit** (configurable via `ROLL_COST` env var)
- Match all 3 symbols to win:
  - **Cherry** = 10 credits
  - **Lemon** = 20 credits
  - **Orange** = 30 credits
  - **Watermelon** = 40 credits
- Cash out anytime to save your credits to the database
- Game sessions persist using Express sessions with cookies

## API Endpoints

All endpoints are prefixed with `/api/game` and require session cookies.

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/game/games` | Create or resume game session | `{ playerId: string }` | `{ sessionId, credits, playerId }` |
| POST | `/api/game/games/roll` | Roll the slot machine | `{}` | `{ symbols: string[], reward: number, credits: number }` |
| DELETE | `/api/game/games` | Cash out and save to database | `{}` | `{ credits: number }` |

### Request/Response Validation

All requests and responses are validated using Zod schemas:
- Request validation via `requestValidationMiddleware`
- Response validation via `responseValidationMiddleware`
- Invalid requests return `400 Bad Request` with validation errors

## The House Edge

The server implements a re-roll mechanism to ensure the house has an advantage:

- **Credits < 40**: Fair, truly random rolls (configurable via `CHEAT_THRESHOLD_LOW`)
- **Credits 40-60**: 30% chance to re-roll winning results (configurable via `CHEAT_CHANCE_LOW`)
- **Credits > 60**: 60% chance to re-roll winning results (configurable via `CHEAT_THRESHOLD_HIGH` and `CHEAT_CHANCE_HIGH`)

When a re-roll is triggered, the server generates a completely new roll — which may or may not be a win. This makes it progressively harder for players to accumulate large credit balances.

### Configuration

All game parameters can be configured via environment variables:

```bash
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-secret-key-here

# Game Configuration
INITIAL_CREDITS=10
ROLL_COST=1

# House Edge Configuration
CHEAT_THRESHOLD_LOW=40
CHEAT_THRESHOLD_HIGH=60
CHEAT_CHANCE_LOW=0.3
CHEAT_CHANCE_HIGH=0.6

# Database
DB_PATH=casino.db
```

## Architecture Highlights

### Backend Architecture

**Layered Design:**
1. **Routes Layer** ([game.router.ts](server/src/routers/game.router.ts)) — Express route handlers with middleware
2. **Service Layer** ([game.service.ts](server/src/services/game.service.ts)) — Business logic for slot machine mechanics
3. **Repository Layer** ([gameHistoryRepository.service.ts](server/src/services/gameHistoryRepository.service.ts)) — Database operations
4. **Entity Layer** ([gameHistory.entity.ts](server/src/entities/gameHistory.entity.ts)) — TypeORM entities

**Middleware Stack:**
- **Session Management** — Express-session with cookie-based sessions
- **Request Validation** — Zod schema validation before route handlers
- **Response Validation** — Zod schema validation before sending responses
- **Error Handling** — Centralized error middleware with custom error classes
- **CORS** — Configured for local development with credentials

**Database:**
- TypeORM with Better-SQLite3 for persistent storage
- Automatic schema synchronization
- Game history stored on cash-out with sessionId, playerId, and final credits

### Frontend Architecture

**State Management:**
- MobX stores for reactive state management
- [game.store.ts](client/src/stores/game.store.ts) — Game state (session, credits, symbols)
- [error.store.ts](client/src/stores/error.store.ts) — Global error handling

**Component Architecture:**
- Material-UI for styled components
- Custom hooks for animation logic:
  - `useReelReveal` — Staggered reveal timing (1s, 2s, 3s)
  - `useSpinAnimation` — Reel spinning animation state
- Axios for API communication with session cookies

**Animation System:**
- Sequential reel reveal with configurable delays
- CSS-based spinning animations
- Smooth transitions between game states

### Type Safety

**Shared Types Package** (`@casino/shared`):
- Single source of truth for types and constants
- Zod schemas for runtime validation
- TypeScript interfaces for compile-time safety
- Both client and server depend on this package

## Error Handling

The application implements comprehensive error handling at multiple levels:

### Server-Side Errors

**Custom Error Classes:**
- `AppError` — Base error class with status code
- `BadRequestError` — 400 errors for invalid requests
- `NotFoundError` — 404 errors for missing resources

**Error Middleware:**
- Catches all errors from route handlers
- Returns consistent error response format
- Logs errors in development mode

### Client-Side Errors

**Error Store** ([error.store.ts](client/src/stores/error.store.ts)):
- Global error state management
- Automatic error display via Material-UI Snackbar
- Auto-dismiss after 6 seconds

### Validation Errors

**Request Validation:**
- Zod schema validation before route handlers
- Returns detailed validation errors
- Prevents invalid data from reaching business logic

**Response Validation:**
- Ensures API responses match expected schema
- Catches serialization issues in development
- Type-safe API contracts

## Testing

### Server Tests (3 test suites)

- [**game.test.ts**](server/src/__tests__/game.test.ts) — Game service logic, win detection, house edge with mocked `Math.random`
- [**gameHistoryRepository.test.ts**](server/src/__tests__/gameHistoryRepository.test.ts) — Database operations, CRUD operations
- [**routes.test.ts**](server/src/__tests__/routes.test.ts) — Integration tests via Supertest covering all endpoints

### Client Tests (2 test suites)

- [**Game.test.tsx**](client/src/__tests__/Game.test.tsx) — Game component integration tests
- [**SlotMachine.test.tsx**](client/src/__tests__/SlotMachine.test.tsx) — Slot machine behavior tests

Run tests with:
```bash
npm test              # Run all tests
npm run test:server   # Server tests only
npm run test:client   # Client tests only
```

## Developer Notes

### Session Management

- Sessions are stored in memory (MemoryStore)
- Session data includes `gameSession` with `playerId` and `credits`
- Sessions persist across page reloads via cookies
- Session destroyed on cash-out

### Game Flow

1. **Start Game** → Creates session with initial credits
2. **Roll** → Deducts 1 credit, generates symbols, applies house edge, adds reward
3. **Cash Out** → Saves final credits to database, destroys session

### House Edge Implementation

The house edge is implemented in [game.service.ts:36](server/src/services/game.service.ts#L36):
1. Generate initial roll
2. If it's a losing roll, return immediately
3. If it's a winning roll, check player's credit level
4. Apply re-roll chance based on credit threshold
5. If re-roll triggered, generate completely new roll

### Database Schema

```sql
CREATE TABLE game_history (
  id TEXT PRIMARY KEY,      -- Session ID
  playerId TEXT NOT NULL,   -- Player identifier
  credits INTEGER NOT NULL, -- Final credits at cash-out
  createdAt DATETIME        -- Timestamp
);
```

### Client Animation Timing

Reel reveals are staggered using custom hooks:
- Reel 1: Reveals after 1 second
- Reel 2: Reveals after 2 seconds
- Reel 3: Reveals after 3 seconds
- Credits update: After all reels revealed

## Project Scripts

### Root Level
- `npm run dev:server` — Start development server
- `npm run dev:client` — Start development client
- `npm run build` — Build all packages (shared, server, client)
- `npm test` — Run all tests (server + client)
- `npm run test:server` — Run server tests only
- `npm run test:client` — Run client tests only
- `npm run lint` — Run ESLint across all packages

### Server Package
- `npm run dev` — Start server with tsx watch mode
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run compiled server
- `npm test` — Run Vitest tests

### Client Package
- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm test` — Run Vitest tests

## Future Improvements

- [ ] Add Redis for distributed session storage (production)
- [ ] Implement player leaderboard using game history
- [ ] Add sound effects for spins and wins
- [ ] Implement multiplayer lobby system
- [ ] Add progressive jackpot feature
- [ ] Create admin dashboard for game monitoring
- [ ] Add more slot machine variations (5 reels, multiple paylines)
- [ ] Implement player authentication system
- [ ] Add real-time notifications using WebSockets
- [ ] Deploy to cloud platform (AWS/Azure/GCP)

## License

MIT
