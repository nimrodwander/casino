import { ThemeProvider, createTheme } from '@mui/material';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Game } from '../components/Game';
import { gameStore } from '../stores/game.store';

// Mock the API service
vi.mock('../services/api.service', () => ({
  apiService: {
    createSession: vi.fn(),
    roll: vi.fn(),
    cashOut: vi.fn(),
  },
}));

import { apiService } from '../services/api.service';

const mockRoll = vi.mocked(apiService.roll);
const mockCashOut = vi.mocked(apiService.cashOut);

const theme = createTheme({ palette: { mode: 'dark' } });

function renderWithTheme(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Game />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Game', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gameStore.reset();
  });

  it('should render game UI with reels and buttons', () => {
    // Set up a game session
    gameStore.sessionId = 'test-id';
    gameStore.credits = 10;

    renderWithTheme();
    
    expect(screen.getByText('Roll')).toBeInTheDocument();
    expect(screen.getByText('Cash Out')).toBeInTheDocument();
    
    // Each reel displays '-' when idle
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(3);
  });

  it('should disable roll button when no credits', () => {
    gameStore.sessionId = 'test-id';
    gameStore.credits = 0;

    renderWithTheme();

    const rollButton = screen.getByText('Roll');
    expect(rollButton).toBeDisabled();
  });

  it('should render 3 reel blocks', async () => {
    gameStore.sessionId = 'test-id';
    gameStore.credits = 10;

    renderWithTheme();

    // Each reel displays '-' when idle
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(3);
  });

  it('should show rolling state and reveal symbols sequentially', async () => {
    vi.useFakeTimers();
    gameStore.sessionId = 'test-id';
    gameStore.credits = 10;
    
    mockRoll.mockResolvedValue({
      symbols: ['cherry', 'lemon', 'orange'],
      reward: 0,
      credits: 9,
    });

    renderWithTheme();

    // Click roll
    await act(async () => {
      fireEvent.click(screen.getByText('Roll'));
    });

    expect(screen.getByText('Rolling...')).toBeInTheDocument();

    // Advance 1s: first reel reveals
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('C')).toBeInTheDocument();

    // Advance to 2s: second reel reveals
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('L')).toBeInTheDocument();

    // Advance to 3s: third reel reveals
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('O')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should show win message when all symbols match', async () => {
    vi.useFakeTimers();
    gameStore.sessionId = 'test-id';
    gameStore.credits = 10;
    
    mockRoll.mockResolvedValue({
      symbols: ['cherry', 'cherry', 'cherry'],
      reward: 10,
      credits: 19,
    });

    renderWithTheme();

    await act(async () => {
      fireEvent.click(screen.getByText('Roll'));
    });

    // Advance past all reveals
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getAllByText('C')).toHaveLength(3);

    vi.useRealTimers();
  });

  it('should handle cash out', async () => {
    gameStore.sessionId = 'test-id';
    gameStore.credits = 10;
    
    mockCashOut.mockResolvedValue({
      credits: 10,
    });

    renderWithTheme();

    await act(async () => {
      fireEvent.click(screen.getByText('Cash Out'));
    });

    expect(mockCashOut).toHaveBeenCalled();
  });
});
