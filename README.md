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
| POST | `/games` | Create/resume session |
| POST | `/games/roll` | Roll the slot machine |
| DELETE | `/games` | Cash out |

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

## Testing

Run tests with `npm test` or:
- `npm run test:server` - Server tests only
- `npm run test:client` - Client tests only

## License

MIT
