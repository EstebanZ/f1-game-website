import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GameComponent.css';

interface GameComponentProps {
  token: string;
}

type GameState = 'waiting' | 'countdown' | 'go' | 'clicked' | 'tooEarly';

const GameComponent: React.FC<GameComponentProps> = ({ token }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [lightsOn, setLightsOn] = useState<number>(0); // Número de luces encendidas (0-5)

  const calculateScore = (reactionTimeMs: number): number => {
    // Puntuación basada en tiempo de reacción
    // Menos tiempo = más puntos
    if (reactionTimeMs < 200) return 1000;
    if (reactionTimeMs < 300) return 800;
    if (reactionTimeMs < 400) return 600;
    if (reactionTimeMs < 500) return 400;
    if (reactionTimeMs < 600) return 200;
    return 100;
  };

  const saveScore = async (reactionTimeMs: number, gameScore: number) => {
    try {
      await axios.post('/api/game/score', {
        reactionTime: reactionTimeMs,
        score: gameScore
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error guardando puntuación:', error);
    }
  };

  const startGame = () => {
    setGameState('countdown');
    setMessage('Preparándose para la salida...');
    setIsGameActive(true);
    setLightsOn(0);
    
    // Encender las 5 luces secuencialmente (cada segundo)
    const lightIntervals = [];
    
    for (let i = 1; i <= 5; i++) {
      const timeout = setTimeout(() => {
        setLightsOn(i);
        setMessage(`Luz ${i} encendida...`);
      }, i * 1000);
      lightIntervals.push(timeout);
    }
    
    // Después de 5 segundos + tiempo aleatorio (0.5-2 segundos), apagar todas las luces
    const finalDelay = 5000 + Math.random() * 1500 + 500;
    
    setTimeout(() => {
      setLightsOn(0); // Apagar todas las luces
      setGameState('go');
      setStartTime(Date.now());
      setMessage('¡SALIDA! ¡PRESIONA ESPACIO!');
    }, finalDelay);
  };

  const handleSpacePress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      
      if (gameState === 'waiting') {
        // Iniciar nueva carrera
        startGame();
        return;
      }
      
      if (gameState === 'clicked' || gameState === 'tooEarly') {
        // Reiniciar carrera
        resetGame();
        return;
      }
      
      if (gameState === 'countdown') {
        // Presionó durante la cuenta regresiva - salida en falso
        setGameState('tooEarly');
        setMessage('¡SALIDA EN FALSO! Espera a que se apaguen todas las luces');
        setIsGameActive(false);
        setLightsOn(0);
        return;
      }
      
      if (gameState === 'go') {
        // Presionó en el momento correcto
        const endTime = Date.now();
        const reactionTimeMs = endTime - startTime;
        const gameScore = calculateScore(reactionTimeMs);
        
        setReactionTime(reactionTimeMs);
        setScore(gameScore);
        setGameState('clicked');
        setMessage(`¡Excelente salida! ${reactionTimeMs}ms`);
        setIsGameActive(false);
        
        // Actualizar mejor tiempo
        if (!bestTime || reactionTimeMs < bestTime) {
          setBestTime(reactionTimeMs);
        }
        
        // Guardar puntuación
        saveScore(reactionTimeMs, gameScore);
      }
    }
  }, [gameState, startTime, bestTime, token, saveScore]);

  useEffect(() => {
    // Siempre escuchar la barra espaciadora
    document.addEventListener('keydown', handleSpacePress);
    
    return () => {
      document.removeEventListener('keydown', handleSpacePress);
    };
  }, [handleSpacePress]);

  const resetGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    setScore(0);
    setMessage('');
    setIsGameActive(false);
    setLightsOn(0);
  };

  const getGameAreaClass = () => {
    switch (gameState) {
      case 'countdown': return 'game-area countdown';
      case 'go': return 'game-area go';
      case 'tooEarly': return 'game-area too-early';
      case 'clicked': return 'game-area success';
      default: return 'game-area';
    }
  };

  return (
    <div className="game-container">
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Último tiempo:</span>
          <span className="stat-value">
            {reactionTime ? `${reactionTime}ms` : '-'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mejor tiempo:</span>
          <span className="stat-value">
            {bestTime ? `${bestTime}ms` : '-'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Última puntuación:</span>
          <span className="stat-value">{score || '-'}</span>
        </div>
      </div>

      <div className={getGameAreaClass()}>
        {/* Semáforo de F1 */}
        <div className="f1-lights">
          {[1, 2, 3, 4, 5].map((lightNumber) => (
            <div
              key={lightNumber}
              className={`f1-light ${lightsOn >= lightNumber ? 'on' : 'off'}`}
            />
          ))}
        </div>
        
        <div className="game-message">
          {message || 'Presiona ESPACIO para empezar la carrera'}
        </div>
        
        {gameState === 'waiting' && (
          <div className="space-instruction">
            ⌨️ Presiona la <strong>BARRA ESPACIADORA</strong> para iniciar
          </div>
        )}
        
        {(gameState === 'clicked' || gameState === 'tooEarly') && (
          <div className="space-instruction">
            ⌨️ Presiona <strong>ESPACIO</strong> para una nueva carrera
          </div>
        )}
      </div>

      <div className="game-instructions">
        <h3>🏎️ Instrucciones del Semáforo F1:</h3>
        <ol>
          <li>Presiona <strong>ESPACIO</strong> para empezar la carrera</li>
          <li>Observa como se encienden las 5 luces rojas secuencialmente</li>
          <li>Cuando todas las luces se apaguen, ¡es la salida!</li>
          <li>Presiona la <strong>barra espaciadora</strong> lo más rápido posible</li>
          <li>Ve tu tiempo de reacción y puntuación</li>
          <li>Presiona <strong>ESPACIO</strong> de nuevo para una nueva carrera</li>
        </ol>
        <p><strong>⚠️ Importante:</strong> Si presionas antes de que se apaguen todas las luces, será una <strong>salida en falso</strong>.</p>
        <p><strong>⌨️ Control:</strong> Todo el juego se controla únicamente con la <strong>BARRA ESPACIADORA</strong>.</p>
      </div>
    </div>
  );
};

export default GameComponent;
