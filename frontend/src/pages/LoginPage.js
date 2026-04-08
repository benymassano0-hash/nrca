import React, { useRef, useState } from 'react';
import api from '../api';
import './LoginPage.css';

function LoginPage({ setUser }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    kennel_name: '',
    city: '',
    province: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
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
    setSuccess('');

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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;

    submitLock.current = true;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/users/register', registerData);
      setSuccess(response.data?.message || 'Conta criada com sucesso. Aguarde aprovação do administrador.');
      setRegisterData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        kennel_name: '',
        city: '',
        province: '',
      });
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="auth-switch">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
            Entrar
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
            Criar Conta
          </button>
        </div>

        <h2>{mode === 'login' ? 'Acesso ao Sistema' : 'Criar Conta'}</h2>
        <p className="login-subtitle">
          {mode === 'login' ? 'Login com utilizador ou email' : 'Registo próprio com aprovação posterior do admin'}
        </p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {mode === 'login' ? (
          <>
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

            <p className="login-help">Se não tiver acesso, pode criar a sua conta e aguardar aprovação do admin.</p>
          </>
        ) : (
          <form onSubmit={handleRegister} className="login-form register-form">
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={registerData.username} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Palavra-passe</label>
              <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Nome completo</label>
              <input name="full_name" value={registerData.full_name} onChange={handleRegisterChange} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="phone" value={registerData.phone} onChange={handleRegisterChange} />
            </div>
            <div className="form-group">
              <label>Nome do canil</label>
              <input name="kennel_name" value={registerData.kennel_name} onChange={handleRegisterChange} />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input name="city" value={registerData.city} onChange={handleRegisterChange} />
            </div>
            <div className="form-group">
              <label>Província</label>
              <input name="province" value={registerData.province} onChange={handleRegisterChange} />
            </div>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'A criar...' : 'Registar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
