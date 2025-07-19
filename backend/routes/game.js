const express = require('express');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// Guardar puntuación del juego
router.post('/score', authenticateToken, (req, res) => {
    const { reactionTime, score } = req.body;
    const userId = req.user.userId;

    if (!reactionTime || !score) {
        return res.status(400).json({ error: 'Tiempo de reacción y puntuación requeridos' });
    }

    if (reactionTime < 0 || score < 0) {
        return res.status(400).json({ error: 'Valores inválidos' });
    }

    const db = getDatabase();

    db.run(
        'INSERT INTO game_scores (user_id, reaction_time, score) VALUES (?, ?, ?)',
        [userId, reactionTime, score],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                db.close();
                return res.status(500).json({ error: 'Error guardando puntuación' });
            }

            db.close();
            res.json({
                id: this.lastID,
                message: 'Puntuación guardada exitosamente',
                reactionTime,
                score
            });
        }
    );
});

// Obtener mejores puntuaciones del usuario
router.get('/scores', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const db = getDatabase();

    db.all(
        `SELECT reaction_time, score, created_at 
         FROM game_scores 
         WHERE user_id = ? 
         ORDER BY score DESC, reaction_time ASC 
         LIMIT ?`,
        [userId, limit],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                db.close();
                return res.status(500).json({ error: 'Error obteniendo puntuaciones' });
            }

            db.close();
            res.json({
                scores: rows,
                count: rows.length
            });
        }
    );
});

// Obtener estadísticas del usuario
router.get('/stats', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const db = getDatabase();

    // Obtener estadísticas generales
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

            // Obtener historial reciente (últimos 7 días)
            db.all(
                `SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as games_played,
                    AVG(reaction_time) as avg_reaction_time,
                    MAX(score) as best_score
                 FROM game_scores 
                 WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
                 GROUP BY DATE(created_at)
                 ORDER BY date DESC`,
                [userId],
                (err, recentHistory) => {
                    if (err) {
                        console.error('Database error:', err);
                        db.close();
                        return res.status(500).json({ error: 'Error obteniendo historial' });
                    }

                    db.close();
                    res.json({
                        stats: {
                            totalGames: stats.total_games || 0,
                            avgReactionTime: stats.avg_reaction_time || 0,
                            bestReactionTime: stats.best_reaction_time || 0,
                            bestScore: stats.best_score || 0,
                            avgScore: stats.avg_score || 0
                        },
                        recentHistory
                    });
                }
            );
        }
    );
});

module.exports = router;
