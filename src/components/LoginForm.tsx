import React, { useState } from 'react';
import './LoginForm.css';
import { getPlayerData, createPlayer, PlayerStats } from '../services/localData';

interface LoginFormProps {
  onLogin: (user: { email: string; name: string }, stats: PlayerStats) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewPlayer, setIsNewPlayer] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const checkExistingPlayer = (email: string) => {
    const playerData = getPlayerData(email);
    if (playerData) {
      // Jugador existente
      setIsNewPlayer(false);
      setName(playerData.name);
      return playerData;
    } else {
      // Nuevo jugador
      setIsNewPlayer(true);
      setName('');
      return null;
    }
  };

  const handleEmailBlur = () => {
    if (email && validateEmail(email)) {
      const emailLower = email.trim().toLowerCase();
      checkExistingPlayer(emailLower);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Debe ser un email válido');
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const existingPlayer = getPlayerData(emailLower);
    
    // Si no existe el jugador y no hemos mostrado el campo de nombre aún
    if (!existingPlayer && !isNewPlayer) {
      // Establecer como nuevo jugador y mostrar el campo de nombre
      setIsNewPlayer(true);
      setName('');
      setError(''); // Limpiar cualquier error
      return; // No proceder con el login hasta que ingrese el nombre
    }

    // Si es un nuevo jugador, verificar que haya ingresado el nombre
    if (!existingPlayer && !name.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    
    try {
      let playerStats = existingPlayer;
      
      if (!playerStats) {
        // Crear nuevo jugador
        const playerName = name.trim() || 'Usuario';
        playerStats = createPlayer(emailLower, playerName);
        
        // No registrar en Google Sheets aquí - se hará al completar el primer juego
        console.log('✅ Nuevo usuario creado localmente:', playerName);
      }
      
      // Login exitoso
      onLogin(
        { email: emailLower, name: playerStats.name },
        playerStats
      );
      
    } catch (error) {
      console.error('❌ Error en el login:', error);
      setError('Hubo un error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="game-header">
          <div className="f1-lights">
            <span className="light red"></span>
            <span className="light red"></span>
            <span className="light red"></span>
            <span className="light red"></span>
            <span className="light red"></span>
          </div>
          <h1>🏎️ F1 Reflex Game</h1>
          <p>Pon a prueba tus reflejos como un piloto de Fórmula 1</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          {isNewPlayer && (
            <div className="form-group new-player-form">
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                autoComplete="name"
              />
              <p className="welcome-message">
                ¡Bienvenido! Parece que es tu primera vez aquí.
              </p>
            </div>
          )}

          {!isNewPlayer && name && (
            <div className="welcome-back">
              <p>¡Bienvenido de vuelta, {name}! 🏁</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <span>
                <span className="spinner"></span>
                {isNewPlayer ? 'Registrando...' : 'Iniciando...'}
              </span>
            ) : (
              isNewPlayer ? 'Registrarse y Jugar' : 'Entrar al Juego'
            )}
          </button>
        </form>

        <div className="game-info">
          <div className="info-section">
            <h3>🎯 Cómo Jugar</h3>
            <ul>
              <li>Espera a que se enciendan las 5 luces rojas</li>
              <li>Cuando se apaguen, presiona ESPACIO lo más rápido posible</li>
              <li>¡Tu tiempo de reacción será medido!</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h3>🏆 Características</h3>
            <ul>
              <li>Guarda tus mejores tiempos localmente</li>
              <li>Estadísticas detalladas de tu progreso</li>
              <li>Compite contigo mismo para mejorar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;