import React, { useState } from 'react';
import './Dashboard.css';
import { PlayerStats, getTopScores, getGameStats, exportAllData, importData, clearPlayerData } from '../services/localData';

interface DashboardProps {
  playerStats: PlayerStats;
}

const Dashboard: React.FC<DashboardProps> = ({ playerStats }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const topScores = getTopScores(playerStats.email, 10);
  const gameStats = getGameStats(playerStats.email);

  const formatTime = (ms: number): string => {
    return ms === Infinity ? 'N/A' : `${ms}ms`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReactionTimeColor = (time: number): string => {
    if (time < 200) return '#4CAF50'; // Verde - Excelente
    if (time < 300) return '#8BC34A'; // Verde claro - Muy bueno
    if (time < 400) return '#FFC107'; // Amarillo - Bueno
    if (time < 500) return '#FF9800'; // Naranja - Regular
    return '#F44336'; // Rojo - Necesita mejorar
  };

  const getPerformanceLevel = (avgTime: number): string => {
    if (avgTime < 200) return 'Piloto Profesional 🏆';
    if (avgTime < 250) return 'Piloto Experto 🥇';
    if (avgTime < 300) return 'Piloto Avanzado 🥈';
    if (avgTime < 350) return 'Piloto Intermedio 🥉';
    if (avgTime < 400) return 'Piloto Novato ⭐';
    return 'En Entrenamiento 📚';
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f1-reflex-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      if (importData(importText)) {
        alert('✅ Datos importados correctamente. Recarga la página para ver los cambios.');
        setImportText('');
        setShowImport(false);
      } else {
        alert('❌ Error: Formato de datos inválido');
      }
    } catch (error) {
      alert('❌ Error importando datos: ' + error);
    }
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ ¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      clearPlayerData(playerStats.email);
      alert('✅ Datos eliminados. Recarga la página.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Mi Dashboard</h2>
        <div className="tab-navigation">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📈 Resumen
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            📝 Historial
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Configuración
          </button>
        </div>
      </div>

      {activeTab === 'overview' && gameStats && (
        <div className="tab-content overview-tab">
          {/* Tarjetas de estadísticas principales */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-content">
                <h3>Partidas Jugadas</h3>
                <div className="stat-number">{gameStats.totalGames}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h3>Mejor Puntuación</h3>
                <div className="stat-number">{playerStats.bestScore}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>Mejor Tiempo</h3>
                <div className="stat-number" style={{ color: gameStats.bestReactionTime ? getReactionTimeColor(gameStats.bestReactionTime) : '#999' }}>
                  {gameStats.bestReactionTime ? formatTime(gameStats.bestReactionTime) : 'Sin datos'}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Tiempo Promedio</h3>
                <div className="stat-number" style={{ color: getReactionTimeColor(gameStats.averageReactionTime) }}>
                  {Math.round(gameStats.averageReactionTime)}ms
                </div>
              </div>
            </div>
          </div>

          {/* Nivel de piloto */}
          <div className="performance-level">
            <h3>🎯 Tu Nivel de Piloto</h3>
            <div className="level-display">
              <div className="level-text">
                {getPerformanceLevel(gameStats.averageReactionTime)}
              </div>
              <div className="level-description">
                {gameStats.averageReactionTime < 200 && "¡Tienes reflejos excepcionales! Estás al nivel de los pilotos profesionales de F1."}
                {gameStats.averageReactionTime >= 200 && gameStats.averageReactionTime < 250 && "¡Excelentes reflejos! Tienes el potencial para competir a alto nivel."}
                {gameStats.averageReactionTime >= 250 && gameStats.averageReactionTime < 300 && "Muy buenos reflejos. Con práctica puedes alcanzar el nivel profesional."}
                {gameStats.averageReactionTime >= 300 && gameStats.averageReactionTime < 350 && "Buenos reflejos. Sigue practicando para mejorar tu consistencia."}
                {gameStats.averageReactionTime >= 350 && gameStats.averageReactionTime < 400 && "Reflejos promedio. La práctica constante te ayudará a mejorar."}
                {gameStats.averageReactionTime >= 400 && "¡Sigue practicando! Cada sesión te ayudará a desarrollar mejores reflejos."}
              </div>
            </div>
          </div>

          {/* Top 5 mejores tiempos */}
          <div className="top-scores">
            <h3>🏅 Tus 5 Mejores Tiempos</h3>
            {topScores.length > 0 ? (
              <div className="scores-list">
                {topScores.slice(0, 5).map((scoreEntry, index) => (
                  <div key={scoreEntry.id} className="score-item">
                    <div className="score-rank">#{index + 1}</div>
                    <div className="score-details">
                      <div className="score-time" style={{ color: getReactionTimeColor(scoreEntry.reactionTime) }}>
                        {scoreEntry.reactionTime}ms
                      </div>
                      <div className="score-points">{scoreEntry.score} pts</div>
                      <div className="score-date">{formatDate(scoreEntry.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>🎮 ¡Aún no has jugado ninguna partida!</p>
                <p>Ve a la sección "Juego" para comenzar.</p>
              </div>
            )}
          </div>

          {/* Progreso y análisis */}
          {gameStats.totalGames > 5 && (
            <div className="progress-analysis">
              <h3>📈 Análisis de Progreso</h3>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <div className="analysis-label">Mejora en el tiempo:</div>
                  <div className="analysis-value">
                    {gameStats.improvement > 0 ? (
                      <span style={{ color: '#4CAF50' }}>
                        +{Math.round(gameStats.improvement)}ms mejor ⬆️
                      </span>
                    ) : gameStats.improvement < 0 ? (
                      <span style={{ color: '#F44336' }}>
                        {Math.round(Math.abs(gameStats.improvement))}ms peor ⬇️
                      </span>
                    ) : (
                      <span>Sin cambios significativos</span>
                    )}
                  </div>
                </div>
                <div className="analysis-item">
                  <div className="analysis-label">Consistencia:</div>
                  <div className="analysis-value">
                    {gameStats.consistency < 50 ? (
                      <span style={{ color: '#4CAF50' }}>Muy consistente 🎯</span>
                    ) : gameStats.consistency < 100 ? (
                      <span style={{ color: '#FFC107' }}>Moderadamente consistente ⚡</span>
                    ) : (
                      <span style={{ color: '#FF9800' }}>Trabajando en consistencia 📈</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content history-tab">
          <h3>📝 Historial Completo de Partidas</h3>
          {topScores.length > 0 ? (
            <div className="history-list">
              {topScores.map((scoreEntry, index) => (
                <div key={scoreEntry.id} className="history-item">
                  <div className="history-rank">#{index + 1}</div>
                  <div className="history-details">
                    <div className="history-time" style={{ color: getReactionTimeColor(scoreEntry.reactionTime) }}>
                      {scoreEntry.reactionTime}ms
                    </div>
                    <div className="history-score">{scoreEntry.score} puntos</div>
                    <div className="history-date">{formatDate(scoreEntry.timestamp)}</div>
                  </div>
                  <div className="history-performance">
                    {scoreEntry.reactionTime < 200 && '🏆 Excepcional'}
                    {scoreEntry.reactionTime >= 200 && scoreEntry.reactionTime < 300 && '🥇 Excelente'}
                    {scoreEntry.reactionTime >= 300 && scoreEntry.reactionTime < 400 && '🥈 Muy bueno'}
                    {scoreEntry.reactionTime >= 400 && scoreEntry.reactionTime < 500 && '🥉 Bueno'}
                    {scoreEntry.reactionTime >= 500 && '📚 En progreso'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>📱 No hay historial de partidas aún.</p>
              <p>¡Comienza a jugar para ver tus estadísticas aquí!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="tab-content settings-tab">
          <h3>⚙️ Configuración y Datos</h3>
          
          <div className="settings-section">
            <h4>📤 Exportar Datos</h4>
            <p>Descarga una copia de seguridad de todos tus datos del juego.</p>
            <button onClick={handleExport} className="export-btn">
              💾 Descargar Backup
            </button>
          </div>

          <div className="settings-section">
            <h4>📥 Importar Datos</h4>
            <p>Restaura tus datos desde un archivo de respaldo.</p>
            <button onClick={() => setShowImport(!showImport)} className="import-toggle-btn">
              {showImport ? '❌ Cancelar' : '📁 Importar Datos'}
            </button>
            
            {showImport && (
              <div className="import-section">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega aquí el contenido de tu archivo de respaldo..."
                  rows={5}
                  className="import-textarea"
                />
                <button onClick={handleImport} className="import-btn">
                  ✅ Importar
                </button>
              </div>
            )}
          </div>

          <div className="settings-section danger-zone">
            <h4>🗑️ Zona de Peligro</h4>
            <p>⚠️ Esta acción eliminará permanentemente todos tus datos.</p>
            <button onClick={handleClearData} className="danger-btn">
              🗑️ Eliminar Todos los Datos
            </button>
          </div>

          <div className="settings-section">
            <h4>ℹ️ Información del Jugador</h4>
            <div className="player-info-grid">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{playerStats.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{playerStats.name.includes('@') ? playerStats.name.split('@')[0] : playerStats.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registrado:</span>
                <span className="info-value">{formatDate(playerStats.registeredAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Última partida:</span>
                <span className="info-value">{formatDate(playerStats.lastPlayed)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
