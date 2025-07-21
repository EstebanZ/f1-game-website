import React, { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import GameComponent from './components/GameComponent';
import Dashboard from './components/Dashboard';
import { getPlayerData, PlayerStats } from './services/localData';

interface User {
  email: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [currentView, setCurrentView] = useState<'game' | 'dashboard'>('game');

  useEffect(() => {
    // Verificar si hay usuario guardado
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Cargar estadísticas del jugador
      const stats = getPlayerData(userData.email);
      setPlayerStats(stats);
    }
  }, []);

  const handleLogin = (userData: User, stats: PlayerStats) => {
    setUser(userData);
    setPlayerStats(stats);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setPlayerStats(null);
    localStorage.removeItem('currentUser');
    setCurrentView('game');
  };

  const updatePlayerStats = (newStats: PlayerStats) => {
    setPlayerStats(newStats);
  };

  if (!user || !playerStats) {
    return (
      <div className="App">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>🏎️ Reflex Game</h1>
          </div>
          <div className="nav-menu">
            <button 
              className={currentView === 'game' ? 'active' : ''}
              onClick={() => setCurrentView('game')}
            >
              Juego
            </button>
            <button 
              className={currentView === 'dashboard' ? 'active' : ''}
              onClick={() => setCurrentView('dashboard')}
            >
              Mi Dashboard
            </button>
          </div>
          <div className="nav-user">
            <span>👋 {user.name.includes('@') ? user.name.split('@')[0] : user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>

      <main className="App-main">
        {currentView === 'game' && (
          <GameComponent 
            playerStats={playerStats} 
            onStatsUpdate={updatePlayerStats}
            userEmail={user.email}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard playerStats={playerStats} />
        )}
      </main>
    </div>
  );
}

export default App;
