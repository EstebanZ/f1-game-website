const express = require('express');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Función para validar email de Gmail
function isValidGmailEmail(email) {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
}

// Función para extraer nombre del email
function extractNameFromEmail(email) {
    return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Autenticar usuario con email (login o registro automático)
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        console.log('🔐 Intento de login con email:', email);

        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email requerido' 
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Validar que sea un email de Gmail
        if (!isValidGmailEmail(normalizedEmail)) {
            return res.status(400).json({ 
                success: false,
                message: 'Debe ser un email de Gmail válido (@gmail.com)' 
            });
        }

        const name = extractNameFromEmail(normalizedEmail);
        const db = getDatabase();

        // Buscar usuario existente
        db.get(
            'SELECT * FROM users WHERE email = ?',
            [normalizedEmail],
            function(err, user) {
                if (err) {
                    console.error('❌ Database error:', err);
                    db.close();
                    return res.status(500).json({ 
                        success: false,
                        message: 'Error de base de datos' 
                    });
                }

                if (user) {
                    // Usuario existente
                    console.log('✅ Usuario encontrado:', user.email);
                    
                    const jwtToken = jwt.sign(
                        { 
                            userId: user.id, 
                            email: user.email, 
                            isAdmin: Boolean(user.is_admin) 
                        },
                        process.env.JWT_SECRET || 'fallback_secret',
                        { expiresIn: '7d' }
                    );

                    db.close();
                    return res.json({
                        success: true,
                        token: jwtToken,
                        user: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            isAdmin: Boolean(user.is_admin)
                        },
                        message: `¡Bienvenido de vuelta, ${user.name}!`
                    });
                } else {
                    // Crear nuevo usuario
                    console.log('🆕 Creando nuevo usuario:', normalizedEmail);
                    
                    db.run(
                        'INSERT INTO users (email, name, is_admin) VALUES (?, ?, ?)',
                        [normalizedEmail, name, 0],
                        function(err) {
                            if (err) {
                                console.error('❌ Database error creando usuario:', err);
                                db.close();
                                return res.status(500).json({ 
                                    success: false,
                                    message: 'Error creando usuario' 
                                });
                            }

                            console.log('✅ Usuario creado con ID:', this.lastID);
                            
                            const jwtToken = jwt.sign(
                                { 
                                    userId: this.lastID, 
                                    email: normalizedEmail, 
                                    isAdmin: false 
                                },
                                process.env.JWT_SECRET || 'fallback_secret',
                                { expiresIn: '7d' }
                            );

                            db.close();
                            return res.json({
                                success: true,
                                token: jwtToken,
                                user: {
                                    id: this.lastID,
                                    email: normalizedEmail,
                                    name: name,
                                    isAdmin: false
                                },
                                message: `¡Bienvenido al juego, ${name}! Tu cuenta ha sido creada.`
                            });
                        }
                    );
                }
            }
        );

    } catch (error) {
        console.error('❌ Error autenticando usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor' 
        });
    }
});

// Verificar JWT token
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token no proporcionado' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        res.json({ 
            success: true,
            valid: true, 
            user: decoded 
        });
    } catch (error) {
        console.error('❌ Token inválido:', error.message);
        res.status(401).json({ 
            success: false,
            message: 'Token inválido o expirado' 
        });
    }
});

module.exports = router;
