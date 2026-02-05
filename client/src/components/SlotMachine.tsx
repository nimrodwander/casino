import { Reel } from './Reel';
import { CreditDisplay } from './CreditDisplay';
import { CashOutButton } from './CashOutButton';
import { useSlotMachine } from '../hooks/useSlotMachine';

export function SlotMachine() {
  const {
    sessionId,
    credits,
    symbols,
    revealedCount,
    spinning,
    message,
    gameOver,
    startGame,
    rollSlots,
    cashOutCredits,
    resetGame,
  } = useSlotMachine();

  // No session yet — show start screen
  if (!sessionId) {
    return (
      <div className="slot-machine">
        <h1>Casino Jackpot</h1>
        <p className="subtitle">Try your luck on the slots!</p>
        <button className="btn btn-start" onClick={startGame}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="slot-machine">
      <h1>Casino Jackpot</h1>

      <CreditDisplay credits={credits} />

      <div className="reels">
        {[0, 1, 2].map((index) => (
          <Reel
            key={index}
            symbol={symbols ? symbols[index] : null}
            revealed={revealedCount > index}
            spinning={spinning}
          />
        ))}
      </div>

      {message && (
        <p className={`message ${message.includes('won') ? 'win' : ''}`}>
          {message}
        </p>
      )}

      <div className="controls">
        {gameOver ? (
          <button className="btn btn-start" onClick={resetGame}>
            New Game
          </button>
        ) : (
          <>
            <button
              className="btn btn-roll"
              onClick={rollSlots}
              disabled={spinning || credits <= 0}
            >
              {spinning ? 'Rolling...' : 'Roll'}
            </button>
            <CashOutButton
              onCashOut={cashOutCredits}
              disabled={spinning}
            />
          </>
        )}
      </div>

      <div className="legend">
        <p>C = Cherry (10) | L = Lemon (20) | O = Orange (30) | W = Watermelon (40)</p>
      </div>
    </div>
  );
}
