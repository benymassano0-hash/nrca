import React, { useRef, useState } from 'react';
import api from '../api';
import './LoginPage.css';

function LoginPage({ setUser }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (submitLock.current) {
      return;
    }

    const username = String(formData.username || '').trim();
    const password = String(formData.password || '').trim();

    if (!username || !password) {
      setError('Preencha utilizador/email e PIN antes de entrar.');
      return;
    }

    submitLock.current = true;
    setLoading(true);
    setError('');

    try {
      const payload = {
        username,
        password,
      };

      const response = await api.post('/users/login', payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      const destination = response.data.user.user_type === 'admin' ? '/admin' : '/dashboard';
      window.location.assign(destination);
      return;
    } catch (err) {
      if (!err.response) {
        setError('Sem ligação ao servidor. Confirme se o backend está ativo em 127.0.0.1:5000.');
      } else {
        setError(err.response?.data?.error || 'Erro ao fazer login');
      }
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Acesso ao Sistema</h2>
        <p className="login-subtitle">Login com utilizador ou email</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Utilizador ou Email</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ex: massano ou benymassano0@gmail.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label>PIN / Palavra-passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Insira as credenciais"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" onClick={handleSubmit} disabled={loading} className="login-submit">
            {loading ? 'A validar...' : 'Entrar'}
          </button>
        </form>

        <p className="login-help">Se não tiver acesso, contacte a equipa de cadastro.</p>
      </div>
    </div>
  );
}

export default LoginPage;
