import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SlotMachine } from '../components/SlotMachine';
import { slotMachineStore } from '../stores/SlotMachineStore';

// Mock the API client
vi.mock('../api/client', () => ({
  createSession: vi.fn(),
  roll: vi.fn(),
  cashOut: vi.fn(),
}));

import * as api from '../api/client';

const mockCreateSession = vi.mocked(api.createSession);
const mockRoll = vi.mocked(api.roll);
const mockCashOut = vi.mocked(api.cashOut);

const theme = createTheme({ palette: { mode: 'dark' } });

function renderWithTheme() {
  return render(
    <ThemeProvider theme={theme}>
      <SlotMachine />
    </ThemeProvider>
  );
}

describe('SlotMachine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    slotMachineStore.reset();
  });

  it('should render start screen initially', () => {
    renderWithTheme();
    expect(screen.getByText('Casino Jackpot')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('should start a game session', async () => {
    mockCreateSession.mockResolvedValue({ sessionId: 'test-id', credits: 10 });

    renderWithTheme();

    await act(async () => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Roll')).toBeInTheDocument();
    expect(screen.getByText('Cash Out')).toBeInTheDocument();
  });

  it('should render 3 reel blocks after game starts', async () => {
    mockCreateSession.mockResolvedValue({ sessionId: 'test-id', credits: 10 });

    renderWithTheme();

    await act(async () => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    // Each reel displays '-' when idle
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(3);
  });

  it('should show rolling state and reveal symbols sequentially', async () => {
    vi.useFakeTimers();
    mockCreateSession.mockResolvedValue({ sessionId: 'test-id', credits: 10 });
    mockRoll.mockResolvedValue({
      symbols: ['C', 'L', 'O'],
      win: false,
      reward: 0,
      credits: 9,
    });

    renderWithTheme();

    // Start game
    await act(async () => {
      fireEvent.click(screen.getByText('Start Game'));
    });

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

    // Advance to 3s: third reel reveals, credits update
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('O')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('No luck this time.')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should show win message when all symbols match', async () => {
    vi.useFakeTimers();
    mockCreateSession.mockResolvedValue({ sessionId: 'test-id', credits: 10 });
    mockRoll.mockResolvedValue({
      symbols: ['C', 'C', 'C'],
      win: true,
      reward: 10,
      credits: 19,
    });

    renderWithTheme();

    await act(async () => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Roll'));
    });

    // Advance past all reveals
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('You won 10 credits!')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should handle cash out', async () => {
    mockCreateSession.mockResolvedValue({ sessionId: 'test-id', credits: 10 });
    mockCashOut.mockResolvedValue({
      credits: 10,
      message: 'Cashed out 10 credits. Thanks for playing!',
    });

    renderWithTheme();

    await act(async () => {
      fireEvent.click(screen.getByText('Start Game'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cash Out'));
    });

    expect(screen.getByText(/Cashed out/)).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });
});
