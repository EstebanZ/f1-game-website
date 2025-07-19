import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: (user: any, token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Debe ser un email de Gmail válido (@gmail.com)');
      return;
    }

    setLoading(true);
    console.log('🚀 Intentando autenticación con:', email);

    try {
      console.log('📡 Enviando petición a:', '/api/auth/login');
      
      const response = await axios.post('/api/auth/login', { 
        email: email.trim().toLowerCase() 
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Respuesta recibida:', response.data);

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Configurar axios para usar el token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('💬 Mensaje:', response.data.message);
        onLogin(user, token);
      } else {
        setError('Error en la respuesta del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Timeout: El servidor tardó demasiado en responder');
      } else if (error.response) {
        setError(error.response.data?.message || `Error del servidor: ${error.response.status}`);
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏎️ Reflex Game</h1>
          <p>Prueba tus reflejos y compite con otros jugadores</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email de Gmail:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@gmail.com"
              className={error ? 'error' : ''}
              disabled={loading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        <div className="login-info">
          <h3>ℹ️ Cómo jugar:</h3>
          <ul>
            <li>Espera a que aparezca la luz verde</li>
            <li>Presiona la barra espaciadora lo más rápido posible</li>
            <li>Tu tiempo de reacción será registrado</li>
            <li>Compite por el mejor tiempo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
