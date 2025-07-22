import React, { useState, useEffect } from 'react';
import './GlobalDashboard.css';

interface GlobalStats {
  totalPlayers: number;
  totalGames: number;
  globalBestTime: number;
  averageGlobalTime: number;
  topPlayers: Array<{
    name: string;
    email: string;
    bestTime: number;
    totalGames: number;
    averageTime: number;
  }>;
  recentActivity: Array<{
    playerName: string;
    reactionTime: number;
    score: number;
    timestamp: string;
  }>;
}

const GlobalDashboard: React.FC = () => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'activity'>('overview');

  useEffect(() => {
    fetchGlobalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Hacer llamada al Google Apps Script para obtener datos globales
      const scriptUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
      if (!scriptUrl) {
        console.warn('URL del Google Script no configurada, usando datos locales');
        loadLocalFallbackData();
        return;
      }
      
      console.log('Fetching global data from:', `${scriptUrl}?action=getGlobalStats`);
      const response = await fetch(`${scriptUrl}?action=getGlobalStats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Global data received:', data);
      
      if (data.success === false) {
        throw new Error(data.error || 'Error en el servidor');
      }
      
      setGlobalStats(data);
    } catch (err) {
      console.error('Error fetching global data:', err);
      setError(`No se pudieron cargar los datos globales: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      // Fallback a datos locales si falla la conexión
      loadLocalFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalFallbackData = () => {
    console.log('Loading local fallback data...');
    try {
      // Obtener datos locales como fallback
      const allPlayers = JSON.parse(localStorage.getItem('f1-reflex-players') || '{}');
      const allScores = JSON.parse(localStorage.getItem('f1-reflex-scores') || '[]');
      
      console.log('Local players:', allPlayers);
      console.log('Local scores:', allScores);
      
      const players = Object.values(allPlayers) as any[];
      const totalPlayers = players.length;
      const totalGames = allScores.length;
      
      const bestTimes = allScores.map((score: any) => score.reactionTime).filter((time: number) => time > 0);
      const globalBestTime = bestTimes.length > 0 ? Math.min(...bestTimes) : 0;
      const averageGlobalTime = bestTimes.length > 0 ? bestTimes.reduce((a: number, b: number) => a + b, 0) / bestTimes.length : 0;
      
      // Top players basado en mejor tiempo
      const topPlayers = players
        .filter(player => player.bestScore > 0 && player.bestReactionTime > 0)
        .sort((a, b) => a.bestReactionTime - b.bestReactionTime)
        .slice(0, 10)
        .map(player => ({
          name: player.name && player.name.includes('@') ? player.name.split('@')[0] : (player.name || 'Usuario'),
          email: player.email || '',
          bestTime: player.bestReactionTime || 0,
          totalGames: allScores.filter((score: any) => score.playerEmail === player.email).length,
          averageTime: player.averageReactionTime || 0
        }));

      // Actividad reciente
      const recentActivity = allScores
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
        .map((score: any) => {
          const player = players.find(p => p.email === score.playerEmail);
          const playerName = player?.name ? 
            (player.name.includes('@') ? player.name.split('@')[0] : player.name) : 
            'Usuario';
          
          return {
            playerName,
            reactionTime: score.reactionTime || 0,
            score: score.score || 0,
            timestamp: score.timestamp || new Date().toISOString()
          };
        });

      const localStats = {
        totalPlayers,
        totalGames,
        globalBestTime,
        averageGlobalTime,
        topPlayers,
        recentActivity
      };
      
      console.log('Local fallback stats:', localStats);
      setGlobalStats(localStats);
    } catch (error) {
      console.error('Error loading local fallback data:', error);
      // Si fallan los datos locales, mostrar datos vacíos
      setGlobalStats({
        totalPlayers: 0,
        totalGames: 0,
        globalBestTime: 0,
        averageGlobalTime: 0,
        topPlayers: [],
        recentActivity: []
      });
    }
  };

  const formatTime = (ms: number | null): string => {
    if (ms === null || ms === undefined || ms === Infinity || isNaN(ms) || ms <= 0) {
      return 'N/A';
    }
    return `${Math.round(ms)}ms`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
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

  if (loading) {
    return (
      <div className="global-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner">🏎️</div>
          <p>Cargando estadísticas globales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-dashboard-container">
      <div className="global-dashboard-header">
        <h2>🌍 Dashboard Global</h2>
        <div className="last-updated">
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
          <button onClick={fetchGlobalData} className="refresh-btn" disabled={loading}>
            🔄 Actualizar
          </button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Resumen Global
        </button>
        <button 
          className={activeTab === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Ranking
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => setActiveTab('activity')}
        >
          📈 Actividad Reciente
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content overview-tab">
          {globalStats ? (
            <>
              <div className="global-stats-grid">
                <div className="global-stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Pilotos Registrados</h3>
                    <div className="stat-number">{globalStats.totalPlayers}</div>
                  </div>
                </div>

                <div className="global-stat-card">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-content">
                    <h3>Partidas Totales</h3>
                    <div className="stat-number">{globalStats.totalGames}</div>
                  </div>
                </div>

                <div className="global-stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <h3>Mejor Tiempo Global</h3>
                    <div className="stat-number" style={{ color: getReactionTimeColor(globalStats.globalBestTime) }}>
                      {formatTime(globalStats.globalBestTime)}
                    </div>
                  </div>
                </div>

                <div className="global-stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3>Promedio Global</h3>
                    <div className="stat-number" style={{ color: getReactionTimeColor(globalStats.averageGlobalTime) }}>
                      {formatTime(globalStats.averageGlobalTime)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="global-insights">
                <h3>📈 Estadísticas de la Comunidad</h3>
                <div className="insights-grid">
                  <div className="insight-item">
                    <span className="insight-label">Promedio de partidas por piloto:</span>
                    <span className="insight-value">
                      {globalStats.totalPlayers > 0 ? Math.round(globalStats.totalGames / globalStats.totalPlayers) : 0}
                    </span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Nivel de la comunidad:</span>
                    <span className="insight-value">
                      {globalStats.averageGlobalTime < 300 ? '🏆 Experto' : 
                       globalStats.averageGlobalTime < 400 ? '🥈 Avanzado' : 
                       globalStats.averageGlobalTime < 500 ? '🥉 Intermedio' : '📚 En desarrollo'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-message">
              <p>📊 No hay datos disponibles</p>
              <p>Juega algunas partidas para ver estadísticas globales</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="tab-content leaderboard-tab">
          <h3>🏆 Ranking Global de Pilotos</h3>
          {globalStats && globalStats.topPlayers.length > 0 ? (
            <div className="leaderboard-list">
              {globalStats.topPlayers.map((player, index) => (
                <div key={player.email} className={`leaderboard-item ${index < 3 ? 'podium' : ''}`}>
                  <div className="leaderboard-rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="leaderboard-details">
                    <div className="player-name">{player.name.toUpperCase()}</div>
                    <div className="player-stats">
                      <span className="best-time" style={{ color: getReactionTimeColor(player.bestTime) }}>
                        {formatTime(player.bestTime)}
                      </span>
                      <span className="games-count">{player.totalGames} partidas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>🏁 Aún no hay suficientes datos para el ranking.</p>
              <p>¡Sé el primero en establecer un récord!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="tab-content activity-tab">
          <h3>📈 Actividad Reciente</h3>
          {globalStats && globalStats.recentActivity.length > 0 ? (
            <div className="activity-list">
              {globalStats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-player">{activity.playerName.toUpperCase()}</div>
                  <div className="activity-details">
                    <span className="activity-time" style={{ color: getReactionTimeColor(activity.reactionTime) }}>
                      {formatTime(activity.reactionTime)}
                    </span>
                    <span className="activity-score">{activity.score} pts</span>
                    <span className="activity-date">{formatDate(activity.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>📱 No hay actividad reciente registrada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalDashboard;
