import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

interface AdminPanelProps {
  token: string;
}

interface GeneralStats {
  totalUsers: number;
  totalGames: number;
  avgReactionTime: number;
  bestReactionTime: number;
  maxScore: number;
}

interface DailyStats {
  date: string;
  games_played: number;
  active_users: number;
  avg_reaction_time: number;
}

interface LeaderboardEntry {
  name: string;
  email: string;
  total_games: number;
  best_score: number;
  best_reaction_time: number;
  avg_reaction_time: number;
  avg_score: number;
  last_played: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  total_games: number;
  best_score: number;
  best_reaction_time: number;
  last_played: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'users'>('dashboard');
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, token]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneralStats(response.data.generalStats);
      setDailyStats(response.data.dailyStats);
    } catch (error: any) {
      setError('Error cargando estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/leaderboard?limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(response.data.leaderboard);
    } catch (error: any) {
      setError('Error cargando leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error: any) {
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
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

  return (
    <div className="admin-container">
      <h2>🛠️ Panel de Administración</h2>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuarios
        </button>
      </div>

      {loading && <div className="admin-loading">Cargando...</div>}
      {error && <div className="admin-error">{error}</div>}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && generalStats && (
        <div className="admin-dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Total Usuarios</h3>
              <div className="stat-number">{generalStats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <h3>🎮 Total Juegos</h3>
              <div className="stat-number">{generalStats.totalGames}</div>
            </div>
            <div className="stat-card">
              <h3>⚡ Mejor Tiempo Global</h3>
              <div className="stat-number">
                {formatReactionTime(generalStats.bestReactionTime)}
              </div>
            </div>
            <div className="stat-card">
              <h3>🏆 Puntuación Máxima</h3>
              <div className="stat-number">{generalStats.maxScore}</div>
            </div>
          </div>

          {dailyStats.length > 0 && (
            <div className="daily-stats">
              <h3>📈 Estadísticas de los Últimos 30 Días</h3>
              <div className="stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Juegos</th>
                      <th>Usuarios Activos</th>
                      <th>Tiempo Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.slice(0, 10).map((day, index) => (
                      <tr key={index}>
                        <td>{formatDate(day.date)}</td>
                        <td>{day.games_played}</td>
                        <td>{day.active_users}</td>
                        <td>{formatReactionTime(day.avg_reaction_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="admin-leaderboard">
          <h3>🏆 Tabla de Líderes Global</h3>
          {leaderboard.length > 0 ? (
            <div className="leaderboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Posición</th>
                    <th>Usuario</th>
                    <th>Mejor Puntuación</th>
                    <th>Mejor Tiempo</th>
                    <th>Juegos Totales</th>
                    <th>Último Juego</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={index} className={index < 3 ? 'top-player' : ''}>
                      <td>
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </td>
                      <td>
                        <div>
                          <strong>{entry.name}</strong>
                          <br />
                          <small>{entry.email}</small>
                        </div>
                      </td>
                      <td>{entry.best_score}</td>
                      <td>{formatReactionTime(entry.best_reaction_time)}</td>
                      <td>{entry.total_games}</td>
                      <td>{formatDateTime(entry.last_played)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">No hay datos de leaderboard disponibles</div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <h3>👥 Gestión de Usuarios</h3>
          {users.length > 0 ? (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Admin</th>
                    <th>Juegos</th>
                    <th>Mejor Puntuación</th>
                    <th>Mejor Tiempo</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div>
                          <strong>{user.name.includes('@') ? user.name.split('@')[0] : user.name}</strong>
                          <br />
                          <small>{user.email}</small>
                        </div>
                      </td>
                      <td>
                        {user.is_admin ? (
                          <span className="admin-badge">🛠️ Admin</span>
                        ) : (
                          <span className="user-badge">👤 Usuario</span>
                        )}
                      </td>
                      <td>{user.total_games || 0}</td>
                      <td>{user.best_score || '-'}</td>
                      <td>
                        {user.best_reaction_time 
                          ? formatReactionTime(user.best_reaction_time) 
                          : '-'
                        }
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">No hay usuarios registrados</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
