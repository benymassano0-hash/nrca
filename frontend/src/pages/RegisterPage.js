import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './RegisterPage.css';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    user_type: 'breeder'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const navigate = useNavigate();

  const provinces = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
    'Namibe', 'Uíge', 'Zaire'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.password_confirm) {
      setError('As palavras-passe não coincidem!');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres!');
      return false;
    }
    if (!agreedTerms) {
      setError('Deve aceitar os termos e condições!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await api.post('/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        user_type: formData.user_type
      });
      setSuccess('✅ Pedido de registo enviado! O seu acesso será ativado assim que for aprovado pela equipa de cadastro.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.error || 'Erro ao registar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-content">
        {/* Coluna Esquerda - Informações */}
        <div className="register-info">
          <div className="info-header">
            <h1>🐕 Bem-vindo ao RCA</h1>
            <p>Sistema de Pedigree de Angola</p>
          </div>

          <div className="benefits">
            <h3>Benefícios do Registo</h3>
            <ul>
              <li>✅ Registar seus cães de raça</li>
              <li>✅ Acompanhar genealogia completa</li>
              <li>✅ Gerenciar cruzamentos</li>
              <li>✅ Participar em eventos</li>
              <li>✅ Conectar com outros criadores</li>
              <li>✅ Acesso a documentação oficial</li>
            </ul>
          </div>

          <div className="types-info">
            <h3>Tipos de Conta</h3>
            <div className="type-box">
              <strong>🐕 Criador</strong>
              <p>Para criadores profissionais de cães. Acesso completo para registar e gerenciar seus cães e cruzamentos.</p>
            </div>
            <div className="type-box">
              <strong>👓 Consultor</strong>
              <p>Para consultores, juízes ou entusiastas. Acesso para visualizar registos públicos.</p>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Formulário */}
        <div className="register-form-container">
          <div className="form-header">
            <h2>Criar Conta</h2>
            <p>Preencha os dados abaixo para registar-se</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Seção 1: Credenciais */}
            <div className="form-section">
              <h3>Credenciais de Login</h3>
              
              <div className="form-group">
                <label>Username (única)*</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="seu_username"
                  minLength="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Palavra-passe*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mín. 6 caracteres"
                    minLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Palavra-passe*</label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="Repita a palavra-passe"
                    minLength="6"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Informações Pessoais */}
            <div className="form-section">
              <h3>Informações Pessoais</h3>

              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+244 900 000 000"
                />
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Rua, nº, bairro"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Sua cidade"
                  />
                </div>

                <div className="form-group">
                  <label>Província*</label>
                  <select name="province" value={formData.province} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {provinces.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 3: Tipo de Conta */}
            <div className="form-section">
              <h3>Tipo de Conta*</h3>
              
              <div className="type-selector">
                <label className="type-option">
                  <input
                    type="radio"
                    name="user_type"
                    value="breeder"
                    checked={formData.user_type === 'breeder'}
                    onChange={handleChange}
                  />
                  <div className="type-label">
                    <strong>🐕 Criador</strong>
                    <small>Registar e gerenciar cães</small>
                  </div>
                </label>

                <label className="type-option">
                  <input
                    type="radio"
                    name="user_type"
                    value="viewer"
                    checked={formData.user_type === 'viewer'}
                    onChange={handleChange}
                  />
                  <div className="type-label">
                    <strong>👓 Consultor</strong>
                    <small>Visualizar registos públicos</small>
                  </div>
                </label>
              </div>
            </div>

            {/* Termos e Condições */}
            <div className="terms-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  required
                />
                <span>Aceito os <strong>Termos de Serviço</strong> e <strong>Política de Privacidade</strong> do RCA</span>
              </label>
            </div>

            {/* Botões */}
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? '⏳ Processando...' : '✅ Registar'}
              </button>
            </div>

            <p className="login-link">
              Já tem conta? <Link to="/login">Faça login aqui</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
