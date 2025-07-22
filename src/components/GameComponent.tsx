import React, { useState, useEffect, useCallback, useRef } from 'react';
import './GameComponent.css';
import { PlayerStats, addGameScore, getGameStats } from '../services/localData';
import { registerPlayerInGoogleSheets } from '../services/googleSheets';

interface GameComponentProps {
  playerStats: PlayerStats;
  onStatsUpdate: (newStats: PlayerStats) => void;
  userEmail?: string;
}

type GameState = 'waiting' | 'countdown' | 'go' | 'clicked' | 'tooEarly';

const GameComponent: React.FC<GameComponentProps> = ({ playerStats, onStatsUpdate, userEmail }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [lightsOn, setLightsOn] = useState<number>(0);
  const countdownTimeouts = useRef<NodeJS.Timeout[]>([]);

  const calculateScore = (reactionTimeMs: number): number => {
    // Puntuación basada en tiempo de reacción (más realista para F1)
    if (reactionTimeMs < 150) return 1000; // Excepcional (nivel profesional)
    if (reactionTimeMs < 200) return 900;  // Excelente
    if (reactionTimeMs < 250) return 800;  // Muy bueno
    if (reactionTimeMs < 300) return 700;  // Bueno
    if (reactionTimeMs < 350) return 600;  // Promedio superior
    if (reactionTimeMs < 400) return 500;  // Promedio
    if (reactionTimeMs < 500) return 400;  // Por debajo del promedio
    if (reactionTimeMs < 600) return 300;  // Lento
    if (reactionTimeMs < 700) return 200;  // Muy lento
    return 100; // Necesita práctica
  };

  const getPerformanceMessage = (reactionTimeMs: number): string => {
    if (reactionTimeMs < 150) return "🏆 ¡FENOMENAL! Reflejos de CAMPEÓN DEL MUNDO F1";
    if (reactionTimeMs < 200) return "🥇 ¡EXTRAORDINARIO! Nivel de HAMILTON o VERSTAPPEN";
    if (reactionTimeMs < 250) return "🥈 ¡EXCELENTE! Tiempo de piloto F1 profesional";
    if (reactionTimeMs < 300) return "🥉 ¡MUY BUENO! Nivel F2/F3 - Casi profesional";
    if (reactionTimeMs < 350) return "🏎️ BUENO - Nivel karting profesional";
    if (reactionTimeMs < 400) return "⚡ PROMEDIO - Sigue entrenando como los pros";
    if (reactionTimeMs < 500) return "🎯 Necesitas más práctica en el simulador";
    if (reactionTimeMs < 600) return "⏱️ Tiempo amateur - ¡Entrena más!";
    return "🐌 Tiempo de domingo por la mañana - ¡Mucha práctica necesaria!";
  };

  const saveScore = useCallback(async (reactionTimeMs: number, gameScore: number) => {
    try {
      console.log('🔍 Guardando puntuación:', { reactionTimeMs, gameScore, currentBestTime: playerStats.bestReactionTime });
      
      // Guardar localmente
      const newStats = addGameScore(playerStats.email, {
        reactionTime: reactionTimeMs,
        score: gameScore,
        timestamp: new Date().toISOString(),
        lights: 5 // Siempre 5 luces en F1
      });

      if (newStats) {
        console.log('✅ Nuevas estadísticas:', { newBestTime: newStats.bestReactionTime, newBestScore: newStats.bestScore });
        onStatsUpdate(newStats);
        
        // Actualizar en Google Sheets (no bloquear si falla)
        try {
          const gameStats = getGameStats(playerStats.email);
          await registerPlayerInGoogleSheets({
            email: playerStats.email,
            name: playerStats.name,
            bestScore: newStats.bestScore,
            bestReactionTime: gameStats?.bestReactionTime || 0, // Usar el tiempo calculado de gameStats
            gamesPlayed: newStats.totalGames
          });
          console.log('✅ Estadísticas actualizadas en Google Sheets con mejor tiempo:', gameStats?.bestReactionTime);
        } catch (sheetError) {
          console.warn('⚠️ No se pudieron actualizar las estadísticas en Google Sheets:', sheetError);
        }
      }
    } catch (error) {
      console.error('Error guardando puntuación:', error);
    }
  }, [playerStats.email, playerStats.name, playerStats.bestReactionTime, onStatsUpdate]);

  const clearTimeouts = useCallback(() => {
    countdownTimeouts.current.forEach(timeout => clearTimeout(timeout));
    countdownTimeouts.current = [];
  }, []);

  const startGame = useCallback(() => {
    clearTimeouts();
    setGameState('countdown');
    setMessage('Preparándose para la salida...');
    setLightsOn(0);
    setReactionTime(null);
    setScore(0);
    
    // Secuencia de luces como en F1
    const timeouts: NodeJS.Timeout[] = [];
    
    // Encender luces progresivamente (cada 1 segundo exacto como en F1)
    for (let i = 1; i <= 5; i++) {
      const timeout = setTimeout(() => {
        setLightsOn(i);
        setMessage(`Luz ${i} encendida...`);
      }, i * 1000); // 1 segundo exacto entre cada luz
      timeouts.push(timeout);
    }
    
    // Tiempo aleatorio después de la quinta luz (0.2-2 segundos como en F1 real)
    const randomDelay = Math.random() * 1800 + 200; // 200ms-2000ms
    const goTimeout = setTimeout(() => {
      setLightsOn(0); // Apagar todas las luces instantáneamente
      setGameState('go');
      setMessage('¡GO GO GO!');
      setStartTime(Date.now());
    }, 5000 + randomDelay); // 5 segundos para las luces + delay aleatorio
    
    timeouts.push(goTimeout);
    countdownTimeouts.current = timeouts;
  }, [clearTimeouts]);

  const handleSpacePress = useCallback(() => {
    if (gameState === 'waiting') {
      // Iniciar el juego
      startGame();
    } else if (gameState === 'clicked' || gameState === 'tooEarly') {
      // Reiniciar el juego después de completar una partida
      startGame();
    } else if (gameState === 'countdown') {
      // Salida en falso
      clearTimeouts();
      setGameState('tooEarly');
      setMessage('🚨 ¡SALIDA EN FALSO! 🚨'); // Solo el mensaje de error
    } else if (gameState === 'go') {
      // Tiempo válido
      const endTime = Date.now();
      const reactionTimeMs = endTime - startTime;
      const gameScore = calculateScore(reactionTimeMs);
      
      setReactionTime(reactionTimeMs);
      setScore(gameScore);
      setGameState('clicked');
      setMessage(getPerformanceMessage(reactionTimeMs)); // Solo el mensaje de performance
      
      // Guardar puntuación
      saveScore(reactionTimeMs, gameScore);
    }
  }, [gameState, startTime, clearTimeouts, saveScore, startGame]);

  // Manejar la tecla espacio
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleSpacePress();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeouts();
    };
  }, [handleSpacePress, clearTimeouts]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🏁 F1 REACTION CHAMPIONSHIP</h2>
        <div className="player-info">
          <span>🏎️ PILOTO: {(() => {
            const name = userEmail || playerStats.email || 'N/A';
            const displayName = name.includes('@') ? name.split('@')[0] : name;
            return displayName.toUpperCase();
          })()}</span>
          <span>🏆 RÉCORD: {playerStats.bestScore} pts</span>
          <span>⚡ MEJOR TIEMPO PERSONAL: {(() => {
            if (!playerStats.bestReactionTime || playerStats.bestReactionTime === Infinity || playerStats.bestReactionTime <= 0) {
              return 'N/A';
            }
            return `${Math.round(playerStats.bestReactionTime)}ms`;
          })()}</span>
        </div>
      </div>

      {/* Luces de F1 */}
      <div className="f1-lights-display">
        <div className="lights-container">
          {[1, 2, 3, 4, 5].map((lightNumber) => (
            <div 
              key={lightNumber}
              className={`f1-light ${lightsOn >= lightNumber ? 'on' : 'off'}`}
            />
          ))}
        </div>
        <div className="lights-label">FORMULA 1 START LIGHTS</div>
      </div>

      {/* Área principal del juego */}
      <div className="game-main-area">
        {/* Estado del juego */}
        <div className="game-status">
          <div className={`status-message ${gameState}`}>
            {message || (gameState === 'waiting' ? 'Presiona el botón o ESPACIO para comenzar' : '')}
          </div>
          
          {gameState === 'go' && (
            <div className="action-prompt">
              <button 
                className="action-button space-indicator"
                onClick={handleSpacePress}
              >
                ¡REACCIONA AHORA!
              </button>
            </div>
          )}
          
          {gameState === 'countdown' && (
            <div className="action-prompt">
              <button 
                className="action-button countdown-button"
                onClick={handleSpacePress}
              >
                ⚠️ TOCA PARA EARLY START
              </button>
            </div>
          )}
          
          {(gameState === 'clicked' || gameState === 'tooEarly') && (
            <div className="action-prompt">
              <button 
                className="action-button restart-button"
                onClick={handleSpacePress}
              >
                🏁 NUEVA CARRERA
              </button>
            </div>
          )}
        </div>

        {/* Resultados */}
        {reactionTime !== null && gameState === 'clicked' && (
          <div className="game-results">
            <div className="result-item">
              <span className="result-label">Tiempo de Reacción:</span>
              <span className="result-value">{reactionTime}ms</span>
            </div>
            <div className="result-item">
              <span className="result-label">Puntuación:</span>
              <span className="result-value">{score} pts</span>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="game-controls">
          {gameState === 'waiting' && (
            <button 
              className="start-btn action-button"
              onClick={startGame}
            >
              🏁 INICIAR PROCEDIMIENTO F1
            </button>
          )}
          
          {/* Siempre mostrar ayuda adaptada a la plataforma */}
          <div className="control-hints">
            <div className="mobile-hint">
              📱 <strong>Móvil:</strong> Usa los botones para cada acción
            </div>
            <div className="desktop-hint">
              💻 <strong>PC:</strong> <kbd>ESPACIO</kbd> para todo o usa los botones
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="game-instructions">
        <h3>🏁 PROTOCOLO DE LARGADA F1</h3>
        <ol>
          <li><strong>Iniciar:</strong> Toca el botón 🏁 o presiona <kbd>ESPACIO</kbd></li>
          <li>Las 5 luces rojas se encenderán en secuencia (como en F1 real)</li>
          <li><strong>Durante countdown:</strong> Puedes hacer early start tocando el botón ⚠️ o presionando <kbd>ESPACIO</kbd></li>
          <li>Cuando TODAS las luces se apaguen: ¡REACCIONA INMEDIATAMENTE!</li>
          <li><strong>Reaccionar:</strong> Toca "¡REACCIONA AHORA!" o presiona <kbd>ESPACIO</kbd></li>
          <li><strong>Nueva carrera:</strong> Toca "🏁 NUEVA CARRERA" o presiona <kbd>ESPACIO</kbd></li>
          <li>⚠️ EARLY START = Penalización (como en F1 real)</li>
        </ol>
        
        <div className="tips">
          <h4>🏎️ CONSEJOS DE PILOTOS F1:</h4>
          <ul>
            <li><strong>📱 Móvil:</strong> Mantén el dedo listo sobre los botones - cada estado tiene su botón específico</li>
            <li><strong>💻 PC:</strong> Mantén el dedo sobre <kbd>ESPACIO</kbd> como un piloto profesional, o usa los botones</li>
            <li><strong>Ambos:</strong> Concéntrate SOLO en el momento que se apagan las luces</li>
            <li>Hamilton y Verstappen reaccionan en ~180-220ms</li>
            <li>¡La consistencia es clave para ser campeón!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
