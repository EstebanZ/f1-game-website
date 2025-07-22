import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import GameComponent from './components/GameComponent';
import GlobalDashboard from './components/GlobalDashboard';
import LoginForm from './components/LoginForm';
import { PlayerStats, getPlayerData, createPlayer } from './services/localData';

interface User {
  name: string;
  email: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'game' | 'global' | 'login'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    const savedUser = localStorage.getItem('f1-game-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Obtener o crear playerStats
      let stats = getPlayerData(userData.email);
      if (!stats) {
        stats = createPlayer(userData.email, userData.name);
      }
      setPlayerStats(stats);
      setCurrentView('game'); // Cambiar a 'game' en lugar de 'dashboard'
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('f1-game-user', JSON.stringify(userData));
    
    // Obtener o crear playerStats
    let stats = getPlayerData(userData.email);
    if (!stats) {
      stats = createPlayer(userData.email, userData.name);
    }
    setPlayerStats(stats);
    setCurrentView('game'); // Cambiar a 'game' en lugar de 'dashboard'
  };

  const handleLogout = () => {
    setUser(null);
    setPlayerStats(null);
    localStorage.removeItem('f1-game-user');
    setCurrentView('login');
  };

  const handleStatsUpdate = (newStats: PlayerStats) => {
    setPlayerStats(newStats);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleViewChange = (view: 'dashboard' | 'game' | 'global') => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Cerrar menú móvil al navegar
  };

  if (currentView === 'login') {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🏁 F1 Reflex</h1>
        </div>
        
        {/* Botón hamburguesa para móvil */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <button 
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => handleViewChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={currentView === 'game' ? 'active' : ''}
            onClick={() => handleViewChange('game')}
          >
            🏎️ Juego
          </button>
          <button 
            className={currentView === 'global' ? 'active' : ''}
            onClick={() => handleViewChange('global')}
          >
            🌍 Global
          </button>
        </div>

        {/* Usuario móvil solo visible cuando el menú está abierto */}
        {isMobileMenuOpen && (
          <div className="mobile-user-section">
            <span>{user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Salir
            </button>
          </div>
        )}

        <div className="nav-user desktop-user">
          <span>{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Salir
          </button>
        </div>
      </nav>

      <main className="App-main">
        {currentView === 'dashboard' && playerStats && <Dashboard playerStats={playerStats} />}
        {currentView === 'game' && playerStats && (
          <GameComponent 
            playerStats={playerStats} 
            onStatsUpdate={handleStatsUpdate}
            userEmail={user?.email}
          />
        )}
        {currentView === 'global' && <GlobalDashboard />}
      </main>
    </div>
  );
}

export default App;
