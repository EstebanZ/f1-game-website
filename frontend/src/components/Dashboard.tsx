import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

interface DashboardProps {
  token: string;
}

interface Score {
  reaction_time: number;
  score: number;
  created_at: string;
}

interface Stats {
  totalGames: number;
  avgReactionTime: number;
  bestReactionTime: number;
  bestScore: number;
  avgScore: number;
}

interface RecentHistory {
  date: string;
  games_played: number;
  avg_reaction_time: number;
  best_score: number;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentHistory, setRecentHistory] = useState<RecentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [scoresResponse, statsResponse] = await Promise.all([
        axios.get('/api/game/scores?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/game/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setScores(scoresResponse.data.scores);
      setStats(statsResponse.data.stats);
      setRecentHistory(statsResponse.data.recentHistory);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReactionTime = (time: number) => {
    return `${Math.round(time)}ms`;
  };

  if (loading) {
    return <div className="dashboard-loading">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>📊 Mi Dashboard</h2>
      
      {/* Estadísticas generales */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🎮 Juegos Totales</h3>
          <div className="stat-number">{stats?.totalGames || 0}</div>
        </div>
        <div className="stat-card">
          <h3>⚡ Mejor Tiempo</h3>
          <div className="stat-number">
            {stats?.bestReactionTime ? formatReactionTime(stats.bestReactionTime) : '-'}
          </div>
        </div>
        <div className="stat-card">
          <h3>📈 Tiempo Promedio</h3>
          <div className="stat-number">
            {stats?.avgReactionTime ? formatReactionTime(stats.avgReactionTime) : '-'}
          </div>
        </div>
        <div className="stat-card">
          <h3>🏆 Mejor Puntuación</h3>
          <div className="stat-number">{stats?.bestScore || 0}</div>
        </div>
      </div>

      {/* Historial reciente */}
      {recentHistory.length > 0 && (
        <div className="recent-history">
          <h3>📅 Actividad Reciente (7 días)</h3>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Juegos</th>
                  <th>Tiempo Promedio</th>
                  <th>Mejor Puntuación</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((day, index) => (
                  <tr key={index}>
                    <td>{new Date(day.date).toLocaleDateString('es-ES')}</td>
                    <td>{day.games_played}</td>
                    <td>{formatReactionTime(day.avg_reaction_time)}</td>
                    <td>{day.best_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mejores puntuaciones */}
      <div className="best-scores">
        <h3>🏅 Tus Mejores Puntuaciones</h3>
        {scores.length > 0 ? (
          <div className="scores-table">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Tiempo de Reacción</th>
                  <th>Puntuación</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={index} className={index === 0 ? 'best-score' : ''}>
                    <td>#{index + 1}</td>
                    <td className="reaction-time">
                      {formatReactionTime(score.reaction_time)}
                    </td>
                    <td className="score-points">{score.score}</td>
                    <td>{formatDate(score.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-scores">
            <p>¡Aún no has jugado! Ve a la sección de juego para empezar.</p>
          </div>
        )}
      </div>

      <div className="dashboard-actions">
        <button onClick={fetchDashboardData} className="refresh-btn">
          🔄 Actualizar Datos
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
