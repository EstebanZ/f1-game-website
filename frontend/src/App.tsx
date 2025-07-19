import React, { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import GameComponent from './components/GameComponent';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

interface User {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'game' | 'dashboard' | 'admin'>('game');

  useEffect(() => {
    // Verificar si hay token guardado
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('game');
  };

  if (!user || !token) {
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
            {user.isAdmin && (
              <button 
                className={currentView === 'admin' ? 'active' : ''}
                onClick={() => setCurrentView('admin')}
              >
                Admin
              </button>
            )}
          </div>
          <div className="nav-user">
            <span>👋 {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>

      <main className="App-main">
        {currentView === 'game' && <GameComponent token={token} />}
        {currentView === 'dashboard' && <Dashboard token={token} />}
        {currentView === 'admin' && user.isAdmin && <AdminPanel token={token} />}
      </main>
    </div>
  );
}

export default App;
