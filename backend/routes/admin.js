const express = require('express');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Middleware para verificar autenticación y permisos de admin
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Permisos de administrador requeridos' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// Dashboard principal - estadísticas generales
router.get('/dashboard', authenticateAdmin, (req, res) => {
    const db = getDatabase();

    // Obtener estadísticas generales
    db.get(
        `SELECT 
            COUNT(DISTINCT user_id) as total_users,
            COUNT(*) as total_games,
            AVG(reaction_time) as avg_reaction_time,
            MIN(reaction_time) as best_reaction_time,
            MAX(score) as max_score
         FROM game_scores`,
        (err, generalStats) => {
            if (err) {
                console.error('Database error:', err);
                db.close();
                return res.status(500).json({ error: 'Error obteniendo estadísticas' });
            }

            // Obtener estadísticas por día (últimos 30 días)
            db.all(
                `SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as games_played,
                    COUNT(DISTINCT user_id) as active_users,
                    AVG(reaction_time) as avg_reaction_time
                 FROM game_scores 
                 WHERE created_at >= datetime('now', '-30 days')
                 GROUP BY DATE(created_at)
                 ORDER BY date DESC`,
                (err, dailyStats) => {
                    if (err) {
                        console.error('Database error:', err);
                        db.close();
                        return res.status(500).json({ error: 'Error obteniendo estadísticas diarias' });
                    }

                    db.close();
                    res.json({
                        generalStats: {
                            totalUsers: generalStats.total_users || 0,
                            totalGames: generalStats.total_games || 0,
                            avgReactionTime: generalStats.avg_reaction_time || 0,
                            bestReactionTime: generalStats.best_reaction_time || 0,
                            maxScore: generalStats.max_score || 0
                        },
                        dailyStats
                    });
                }
            );
        }
    );
});

// Leaderboard global
router.get('/leaderboard', authenticateAdmin, (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const timeframe = req.query.timeframe || 'all'; // all, week, month

    let timeCondition = '';
    switch (timeframe) {
        case 'week':
            timeCondition = "WHERE gs.created_at >= datetime('now', '-7 days')";
            break;
        case 'month':
            timeCondition = "WHERE gs.created_at >= datetime('now', '-30 days')";
            break;
        default:
            timeCondition = '';
    }

    const db = getDatabase();

    db.all(
        `SELECT 
            u.name,
            u.email,
            COUNT(gs.id) as total_games,
            MAX(gs.score) as best_score,
            MIN(gs.reaction_time) as best_reaction_time,
            AVG(gs.reaction_time) as avg_reaction_time,
            AVG(gs.score) as avg_score,
            MAX(gs.created_at) as last_played
         FROM users u
         INNER JOIN game_scores gs ON u.id = gs.user_id
         ${timeCondition}
         GROUP BY u.id
         ORDER BY best_score DESC, best_reaction_time ASC
         LIMIT ?`,
        [limit],
        (err, leaderboard) => {
            if (err) {
                console.error('Database error:', err);
                db.close();
                return res.status(500).json({ error: 'Error obteniendo leaderboard' });
            }

            db.close();
            res.json({
                leaderboard,
                timeframe,
                count: leaderboard.length
            });
        }
    );
});

// Obtener todos los usuarios
router.get('/users', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Obtener total de usuarios
    db.get('SELECT COUNT(*) as total FROM users', (err, countResult) => {
        if (err) {
            console.error('Database error:', err);
            db.close();
            return res.status(500).json({ error: 'Error contando usuarios' });
        }

        // Obtener usuarios con estadísticas
        db.all(
            `SELECT 
                u.id,
                u.email,
                u.name,
                u.is_admin,
                u.created_at,
                COUNT(gs.id) as total_games,
                MAX(gs.score) as best_score,
                MIN(gs.reaction_time) as best_reaction_time,
                MAX(gs.created_at) as last_played
             FROM users u
             LEFT JOIN game_scores gs ON u.id = gs.user_id
             GROUP BY u.id
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset],
            (err, users) => {
                if (err) {
                    console.error('Database error:', err);
                    db.close();
                    return res.status(500).json({ error: 'Error obteniendo usuarios' });
                }

                db.close();
                res.json({
                    users,
                    pagination: {
                        page,
                        limit,
                        total: countResult.total,
                        totalPages: Math.ceil(countResult.total / limit)
                    }
                });
            }
        );
    });
});

// Obtener detalles de un usuario específico
router.get('/users/:userId', authenticateAdmin, (req, res) => {
    const userId = parseInt(req.params.userId);

    if (!userId) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const db = getDatabase();

    // Obtener información del usuario
    db.get(
        'SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                console.error('Database error:', err);
                db.close();
                return res.status(500).json({ error: 'Error obteniendo usuario' });
            }

            if (!user) {
                db.close();
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Obtener estadísticas del usuario
            db.get(
                `SELECT 
                    COUNT(*) as total_games,
                    AVG(reaction_time) as avg_reaction_time,
                    MIN(reaction_time) as best_reaction_time,
                    MAX(score) as best_score,
                    AVG(score) as avg_score
                 FROM game_scores 
                 WHERE user_id = ?`,
                [userId],
                (err, stats) => {
                    if (err) {
                        console.error('Database error:', err);
                        db.close();
                        return res.status(500).json({ error: 'Error obteniendo estadísticas' });
                    }

                    // Obtener historial de juegos recientes
                    db.all(
                        `SELECT reaction_time, score, created_at 
                         FROM game_scores 
                         WHERE user_id = ? 
                         ORDER BY created_at DESC 
                         LIMIT 20`,
                        [userId],
                        (err, recentGames) => {
                            if (err) {
                                console.error('Database error:', err);
                                db.close();
                                return res.status(500).json({ error: 'Error obteniendo historial' });
                            }

                            db.close();
                            res.json({
                                user,
                                stats: {
                                    totalGames: stats.total_games || 0,
                                    avgReactionTime: stats.avg_reaction_time || 0,
                                    bestReactionTime: stats.best_reaction_time || 0,
                                    bestScore: stats.best_score || 0,
                                    avgScore: stats.avg_score || 0
                                },
                                recentGames
                            });
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
