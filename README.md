# Casino Jackpot

A full-stack slot machine game where the house always wins! Built with React, Node.js, TypeScript, and SQLite.

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI, MobX
- **Backend**: Node.js, Express, TypeORM, SQLite
- **Validation**: Zod schemas
- **Architecture**: Mono-repo with shared types

## Getting Started

```bash
# Install dependencies
npm install

# Start server (port 3001)
npm run dev:server

# Start client (port 5173) - in a new terminal
npm run dev:client

# Run tests
npm test
```

## Project Structure

```
casino/
├── shared/        # Shared types, schemas, constants
├── server/        # Express API + SQLite database
│   ├── routers/       # REST endpoints
│   ├── services/      # Game logic + database
│   ├── middlewares/   # Session, validation, errors
│   └── __tests__/     # Unit + integration tests
└── client/        # React frontend
    ├── components/    # UI components
    ├── stores/        # MobX state
    ├── hooks/         # Animation hooks
    └── __tests__/     # Component tests
```

## Game Rules

- Start with **10 credits**
- Each roll costs **1 credit**
- Match all 3 symbols to win:
  - Cherry = 10 credits
  - Lemon = 20 credits
  - Orange = 30 credits
  - Watermelon = 40 credits
- Cash out anytime to save to database

## API Endpoints

Base URL: `/api/game`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/games/current` | Create/resume session |
| POST | `/games/current/roll` | Roll the slot machine |
| POST | `/games/current/persist` | Cash out and save to database |

## The House Edge

The server re-rolls winning results to favor the house:

- **Credits < 40**: Fair rolls
- **Credits 40-60**: 30% re-roll chance on wins
- **Credits > 60**: 60% re-roll chance on wins

All thresholds are configurable via environment variables.

## Configuration

Create a `.env` file in the server directory:

```bash
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-secret-key
INITIAL_CREDITS=10
ROLL_COST=1
CHEAT_THRESHOLD_LOW=40
CHEAT_THRESHOLD_HIGH=60
CHEAT_CHANCE_LOW=0.3
CHEAT_CHANCE_HIGH=0.6
DB_PATH=casino.db
```

## Architecture

**Backend**: Layered architecture with routes → services → repository → database
- Express sessions for game state
- Zod validation on all endpoints
- TypeORM with Better-SQLite3
- Custom error handling

**Frontend**: Component-based with MobX stores
- Material-UI components
- Staggered reel reveal animations (1s, 2s, 3s)
- Axios for API calls with session cookies

## Design Decisions

### Single Game Session per Player
Modeled after real-world casino behavior where a player finishes one game before moving to another. Each session maintains one active game, and players must cash out before starting a new game.

### Session ID as Primary Key for Game History
Used the session ID as the primary key in the database rather than player ID. This prevents multiple active sessions per player (enforced by session cookies) while still allowing historical tracking. When a player cashes out, the session ID + player ID + credits are persisted to the database, enabling session history tracking per player without allowing concurrent sessions.

### Express-Session over Redis
Chose in-memory Express sessions for simplicity and zero infrastructure setup. While Redis is better for horizontal scaling, it wasn't a requirement and would add unnecessary complexity. For production scaling, migrating to Redis is straightforward.

### SQLite over PostgreSQL/MySQL
Selected SQLite (`casino.db`) for simplicity and no external database setup required. TypeORM abstracts the database layer, making it easy to migrate to PostgreSQL or MySQL for production without code changes.

### Dynamic Reel Count
The reel count is configurable via `DEFAULT_REEL_COUNT` constant in the shared package. If requirements change (e.g., 4 or 5 reels instead of 3), it's a single constant change rather than refactoring the entire codebase.

### Shared Constants Strategy
Constants are stored in the `@casino/shared` package and imported by both client and server. This ensures consistency across the stack. Symbol rewards could have been stored in the database, but they're true constants (not configurable weights), so keeping them in code is simpler and more performant. Runtime configuration (game rules, thresholds) uses environment variables, while compile-time constants (symbols, reel count) live in the shared package.

### Credit Deduction Timing
Credits are deducted **before** the roll, not after. This ensures the house edge logic sees the post-payment balance, and prevents edge cases where players could spam rolls if deduction happened after. Matches real slot machine behavior.

### Centralized Error Handling Architecture
Implemented a comprehensive error handling strategy across both server and client:

**Server-Side**: Custom error classes (`AppError`, `BadRequestError`, `NotFoundError`) flow through a centralized error middleware. The `asyncHandler` wrapper eliminates try-catch blocks in route handlers, automatically forwarding errors to the middleware. All errors are caught, transformed into consistent response format, and returned to the client with appropriate HTTP status codes.

**Client-Side**: Axios interceptors provide a single point for handling all HTTP errors. The interceptor extracts error messages from failed responses and updates the global `errorStore` (MobX), which triggers UI notifications via Material-UI Snackbar. This eliminates repetitive error handling code in every API call and ensures consistent error display across the application.

### Dual Validation Strategy (Request + Response)
Implemented both request and response validation using Zod schemas. Request validation catches bad input early, while response validation ensures the API contract is never violated—catching serialization bugs during development before they reach production.

### Custom React Hooks for Animation
Created two specialized hooks for slot machine animations:
- **`useReelReveal`**: Manages staggered reveal timing (1s, 2s, 3s) and completion callbacks
- **`useSpinAnimation`**: Handles spinning state with cycling characters and configurable intervals

This separates animation logic from rendering, making both testable, reusable, and easily configurable.