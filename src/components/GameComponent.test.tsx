import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameComponent from './GameComponent';
import { PlayerStats } from '../services/localData';

// Mock the services
jest.mock('../services/localData', () => ({
  addGameScore: jest.fn(() => ({
    name: 'Test Player',
    email: 'test@example.com',
    bestScore: 1000,
    bestReactionTime: 200,
    totalGames: 1,
    lastPlayed: new Date().toISOString()
  })),
  getGameStats: jest.fn(() => ({
    bestReactionTime: 200
  }))
}));

jest.mock('../services/googleSheets', () => ({
  registerPlayerInGoogleSheets: jest.fn(() => Promise.resolve())
}));

const mockPlayerStats: PlayerStats = {
  name: 'Test Player',
  email: 'test@example.com',
  bestScore: 0,
  bestReactionTime: Infinity,
  averageReactionTime: 0,
  totalGames: 0,
  lastPlayed: '',
  scores: [],
  registeredAt: new Date().toISOString()
};

const mockOnStatsUpdate = jest.fn();

describe('GameComponent Timer Bug Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should handle early start correctly without infinite re-renders', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <GameComponent 
        playerStats={mockPlayerStats} 
        onStatsUpdate={mockOnStatsUpdate}
        userEmail="test@example.com"
      />
    );

    const startButton = screen.getByText(/INICIAR PROCEDIMIENTO F1/i);
    fireEvent.click(startButton);

    // Wait for countdown to start
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Simulate early start
    const earlyStartButton = screen.getByText(/TOCA PARA EARLY START/i);
    fireEvent.click(earlyStartButton);

    // Should show early start message without infinite re-renders
    expect(screen.getByText(/SALIDA EN FALSO/i)).toBeInTheDocument();
    
    // Check that no "Maximum update depth exceeded" errors occurred
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/Maximum update depth exceeded/)
    );
    
    consoleSpy.mockRestore();
  });

  test('should allow game restart without timer conflicts', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <GameComponent 
        playerStats={mockPlayerStats} 
        onStatsUpdate={mockOnStatsUpdate}
        userEmail="test@example.com"
      />
    );

    // Start game
    const startButton = screen.getByText(/INICIAR PROCEDIMIENTO F1/i);
    fireEvent.click(startButton);

    // Wait for countdown
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Do early start
    const earlyStartButton = screen.getByText(/TOCA PARA EARLY START/i);
    fireEvent.click(earlyStartButton);

    // Restart game
    const newRaceButton = screen.getByRole('button', { name: /NUEVA CARRERA/i });
    fireEvent.click(newRaceButton);

    // Should be back to countdown state without errors
    expect(screen.getByText(/Preparándose para la salida/i)).toBeInTheDocument();
    
    // Check that no circular dependency errors occurred
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/Maximum update depth exceeded/)
    );
    
    consoleSpy.mockRestore();
  });

  test('should clear timeouts properly when switching states', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    render(
      <GameComponent 
        playerStats={mockPlayerStats} 
        onStatsUpdate={mockOnStatsUpdate}
        userEmail="test@example.com"
      />
    );

    // Start game (this creates timeouts)
    const startButton = screen.getByText(/INICIAR PROCEDIMIENTO F1/i);
    fireEvent.click(startButton);

    // Do early start (this should clear timeouts)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    const earlyStartButton = screen.getByText(/TOCA PARA EARLY START/i);
    fireEvent.click(earlyStartButton);

    // Verify that clearTimeout was called (timeouts were cleaned up)
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});