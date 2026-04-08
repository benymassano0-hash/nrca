import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './AdminDashboardPage.css';

function AdminDashboardPage({ user }) {
  const [stats, setStats] = useState(null);
  const [recentDogs, setRecentDogs] = useState([]);
  const [agentStats, setAgentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breederCanRegister, setBreederCanRegister] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleMessage, setToggleMessage] = useState('');
  const [toggleError, setToggleError] = useState('');

  const [fees, setFees] = useState({ ticket_price: '', dog_registration_fee: '', litter_registration_fee: '', breeder_registration_fee: '' });
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesSaving, setFeesSaving] = useState(false);
  const [feesMessage, setFeesMessage] = useState('');
  const [feesError, setFeesError] = useState('');

  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promo, setPromo] = useState({ title: '', description: '', discount: '' });
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    loadAll();
    loadBreederSetting();
    loadFees();
    loadPromo();
  }, []);

  const loadAll = async () => {
    try {
      const [dogsRes, breedingsRes, breedsRes, usersRes, eventsRes] = await Promise.all([
        api.get('/dogs'),
        api.get('/breedings'),
        api.get('/breeds'),
        api.get('/users'),
        api.get('/events/published').catch(() => ({ data: [] })),
      ]);

      setStats({
        totalDogs: dogsRes.data.length,
        totalBreedings: breedingsRes.data.length,
        totalBreeds: breedsRes.data.length,
        totalUsers: usersRes.data.length,
        totalEvents: eventsRes.data.length,
        breeders: usersRes.data.filter(u => u.user_type === 'breeder').length,
        agents: usersRes.data.filter(u => u.user_type === 'registration_agent').length,
        admins: usersRes.data.filter(u => u.user_type === 'admin').length,
        pendingVerification: usersRes.data.filter(u => !u.is_verified && u.user_type !== 'admin').length,
      });

      setRecentDogs(dogsRes.data.slice(0, 5));

      try {
        const agentRes = await api.get('/users/agents/stats/monthly');
        setAgentStats(agentRes.data || []);
      } catch (_) {}
    } catch (error) {
      console.error('Erro ao carregar dados do painel admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBreederSetting = async () => {
    try {
      const res = await api.get('/settings/breeders_can_register_dogs');
      setBreederCanRegister(res.data.value === true || res.data.value === 'true');
    } catch (error) {
      console.error('Erro ao carregar setting de criadores:', error);
      setBreederCanRegister(true); // default true
    }
  };

  const loadFees = async () => {
    setFeesLoading(true);
    try {
      const [ticketRes, dogRes, litterRes, breederRes] = await Promise.allSettled([
        api.get('/settings/ticket_price'),
        api.get('/settings/dog_registration_fee'),
        api.get('/settings/litter_registration_fee'),
        api.get('/settings/breeder_registration_fee'),
      ]);
      setFees({
        ticket_price: ticketRes.status === 'fulfilled' ? ticketRes.value.data.value : '',
        dog_registration_fee: dogRes.status === 'fulfilled' ? dogRes.value.data.value : '',
        litter_registration_fee: litterRes.status === 'fulfilled' ? litterRes.value.data.value : '',
        breeder_registration_fee: breederRes.status === 'fulfilled' ? breederRes.value.data.value : '',
      });
    } catch (_) {}
    finally { setFeesLoading(false); }
  };

  const handleSaveFees = async () => {
    setFeesSaving(true);
    setFeesMessage('');
    setFeesError('');
    try {
      await Promise.all([
        api.put('/settings/ticket_price', { value: Number(fees.ticket_price) || 0 }),
        api.put('/settings/dog_registration_fee', { value: Number(fees.dog_registration_fee) || 0 }),
        api.put('/settings/litter_registration_fee', { value: Number(fees.litter_registration_fee) || 0 }),
        api.put('/settings/breeder_registration_fee', { value: Number(fees.breeder_registration_fee) || 0 }),
      ]);
      setFeesMessage('✅ Preços guardados com sucesso');
      setTimeout(() => setFeesMessage(''), 3000);
    } catch (_) {
      setFeesError('❌ Erro ao guardar preços');
      setTimeout(() => setFeesError(''), 3000);
    } finally {
      setFeesSaving(false);
    }
  };

  const loadPromo = async () => {
    setPromoLoading(true);
    try {
      const [enabledRes, titleRes, descRes, discountRes] = await Promise.allSettled([
        api.get('/settings/promo_enabled'),
        api.get('/settings/promo_title'),
        api.get('/settings/promo_description'),
        api.get('/settings/promo_discount'),
      ]);
      setPromoEnabled(enabledRes.status === 'fulfilled' && (enabledRes.value.data.value === true || enabledRes.value.data.value === 'true'));
      setPromo({
        title: titleRes.status === 'fulfilled' ? titleRes.value.data.value || '' : '',
        description: descRes.status === 'fulfilled' ? descRes.value.data.value || '' : '',
        discount: discountRes.status === 'fulfilled' ? discountRes.value.data.value || '' : '',
      });
    } catch (_) {}
    finally { setPromoLoading(false); }
  };

  const handleTogglePromo = async () => {
    const newVal = !promoEnabled;
    try {
      await api.put('/settings/promo_enabled', { value: newVal });
      setPromoEnabled(newVal);
    } catch (_) {
      setPromoError('❌ Erro ao alterar estado da promoção');
      setTimeout(() => setPromoError(''), 3000);
    }
  };

  const handleSavePromo = async () => {
    setPromoSaving(true);
    setPromoMessage('');
    setPromoError('');
    try {
      await Promise.all([
        api.put('/settings/promo_title', { value: promo.title }),
        api.put('/settings/promo_description', { value: promo.description }),
        api.put('/settings/promo_discount', { value: Number(promo.discount) || 0 }),
      ]);
      setPromoMessage('✅ Promoção guardada com sucesso');
      setTimeout(() => setPromoMessage(''), 3000);
    } catch (_) {
      setPromoError('❌ Erro ao guardar promoção');
      setTimeout(() => setPromoError(''), 3000);
    } finally {
      setPromoSaving(false);
    }
  };

  const handleToggleBreederRegistration = async () => {
    setToggleLoading(true);
    setToggleMessage('');
    setToggleError('');
    
    try {
      const newValue = !breederCanRegister;
      await api.put('/settings/breeders_can_register_dogs', { value: newValue });
      setBreederCanRegister(newValue);
      setToggleMessage(newValue ? '✅ Criadores podem registar cães' : '✅ Criadores bloqueados de registar');
      setTimeout(() => setToggleMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar setting:', error);
      setToggleError('❌ Erro ao atualizar permissão');
      setTimeout(() => setToggleError(''), 3000);
    } finally {
      setToggleLoading(false);
    }
  };


  if (loading) return <div className="loading">A carregar painel...</div>;

  return (
    <div className="admin-dashboard">
      {/* Cabeçalho */}
      <div className="admin-header">
        <div className="admin-header-text">
          <h1>⚙️ Painel de Administração</h1>
          <p>Bem-vindo, <strong>{user?.full_name || user?.username}</strong> — RCA</p>
        </div>
        <span className="admin-badge">ADMIN</span>
      </div>

      {/* Cartões de Estatísticas */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card blue">
            <div className="stat-icon">🐕</div>
            <div>
              <div className="stat-num">{stats.totalDogs}</div>
              <div className="stat-label">Cães Registados</div>
            </div>
          </div>
          <div className="admin-stat-card green">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-num">{stats.totalUsers}</div>
              <div className="stat-label">Utilizadores</div>
            </div>
          </div>
          <div className="admin-stat-card purple">
            <div className="stat-icon">🐾</div>
            <div>
              <div className="stat-num">{stats.totalBreeds}</div>
              <div className="stat-label">Raças</div>
            </div>
          </div>
          <div className="admin-stat-card orange">
            <div className="stat-icon">👶</div>
            <div>
              <div className="stat-num">{stats.totalBreedings}</div>
              <div className="stat-label">Ninhadas</div>
            </div>
          </div>
          <div className="admin-stat-card teal">
            <div className="stat-icon">📅</div>
            <div>
              <div className="stat-num">{stats.totalEvents}</div>
              <div className="stat-label">Eventos</div>
            </div>
          </div>
          {stats.pendingVerification > 0 && (
            <div className="admin-stat-card red">
              <div className="stat-icon">⏳</div>
              <div>
                <div className="stat-num">{stats.pendingVerification}</div>
                <div className="stat-label">A aguardar verificação</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composição de utilizadores */}
      {stats && (
        <div className="admin-section">
          <h2>👥 Composição de Utilizadores</h2>
          <div className="user-breakdown">
            <div className="user-type-bar">
              <span className="user-type-label">Criadores</span>
              <div className="user-type-track">
                <div
                  className="user-type-fill fill-breeder"
                  style={{ width: `${Math.round((stats.breeders / Math.max(1, stats.totalUsers)) * 100)}%` }}
                />
              </div>
              <span className="user-type-count">{stats.breeders}</span>
            </div>
            <div className="user-type-bar">
              <span className="user-type-label">Agentes</span>
              <div className="user-type-track">
                <div
                  className="user-type-fill fill-agent"
                  style={{ width: `${Math.round((stats.agents / Math.max(1, stats.totalUsers)) * 100)}%` }}
                />
              </div>
              <span className="user-type-count">{stats.agents}</span>
            </div>
            <div className="user-type-bar">
              <span className="user-type-label">Admins</span>
              <div className="user-type-track">
                <div
                  className="user-type-fill fill-admin"
                  style={{ width: `${Math.round((stats.admins / Math.max(1, stats.totalUsers)) * 100)}%` }}
                />
              </div>
              <span className="user-type-count">{stats.admins}</span>
            </div>
          </div>
        </div>
      )}

      {/* Acções rápidas */}
      <div className="admin-section">
        <h2>⚡ Acções Rápidas</h2>
        <div className="admin-actions-grid">
          <Link to="/admin/usuarios" className="admin-action-card action-users">
            <span className="action-icon">👥</span>
            <span className="action-title">Gerir Utilizadores</span>
            <span className="action-desc">Criadores, agentes e verificações</span>
          </Link>
          <Link to="/dogs" className="admin-action-card action-dogs">
            <span className="action-icon">🐕</span>
            <span className="action-title">Registar Cão</span>
            <span className="action-desc">Adicionar novo cão ao registo</span>
          </Link>
          <Link to="/breedings" className="admin-action-card action-breedings">
            <span className="action-icon">👶</span>
            <span className="action-title">Gerir Ninhadas</span>
            <span className="action-desc">Registar e acompanhar ninhadas</span>
          </Link>
          <Link to="/breeds" className="admin-action-card action-breeds">
            <span className="action-icon">🐾</span>
            <span className="action-title">Gerir Raças</span>
            <span className="action-desc">493 raças disponíveis</span>
          </Link>
          <Link to="/anunciar-evento" className="admin-action-card action-events">
            <span className="action-icon">📅</span>
            <span className="action-title">Anunciar Evento</span>
            <span className="action-desc">Criar novo evento público</span>
          </Link>
          <Link to="/transferir-cao" className="admin-action-card action-transfer">
            <span className="action-icon">🔄</span>
            <span className="action-title">Transferir Cão</span>
            <span className="action-desc">Transferência de propriedade</span>
          </Link>
          <Link to="/pedigree-buscar" className="admin-action-card action-pedigree">
            <span className="action-icon">🌳</span>
            <span className="action-title">Pesquisar Pedigree</span>
            <span className="action-desc">Consulta pública de árvore</span>
          </Link>
          <Link to="/dashboard" className="admin-action-card action-dashboard">
            <span className="action-icon">📊</span>
            <span className="action-title">Dashboard Geral</span>
            <span className="action-desc">Estatísticas e gráficos</span>
          </Link>
        </div>
      </div>

      {/* Controlo de Permissões */}
      <div className="admin-section">
        <h2>🔐 Controlo de Permissões</h2>
        <div className="permissions-grid">
          <div className="permission-card">
            <div className="permission-header">
              <h3>🔓 Criadores Podem Registar Cães</h3>
              <p className="permission-desc">Permite que criadores registem novos cães no sistema</p>
            </div>
            <div className="permission-control">
              <button
                className={`toggle-switch ${breederCanRegister ? 'active' : 'inactive'}`}
                onClick={handleToggleBreederRegistration}
                disabled={toggleLoading}
              >
                <span className="toggle-circle"></span>
              </button>
              <span className={`permission-status ${breederCanRegister ? 'status-on' : 'status-off'}`}>
                {breederCanRegister ? '✅ ATIVO' : '🔒 BLOQUEADO'}
              </span>
            </div>
            {toggleMessage && <p className="permission-message success">{toggleMessage}</p>}
            {toggleError && <p className="permission-message error">{toggleError}</p>}
            <p className="permission-note">
              {breederCanRegister
                ? '✓ Criadores podem aceder ao formulário de registo de cães'
                : '✗ Criadores não conseguem aceder ao formulário de registo'
              }
            </p>
          </div>

        </div>
      </div>

      {/* Cães recentemente registados */}
      <div className="admin-section">
        <div className="section-header-row">
          <h2>🐕 Últimos Cães Registados</h2>
          <Link to="/dogs" className="see-all-link">Ver todos →</Link>
        </div>
        {recentDogs.length === 0 ? (
          <p className="no-data">Nenhum cão registado ainda.</p>
        ) : (
          <div className="recent-dogs-table">
            <table>
              <thead>
                <tr>
                  <th>ID Registo</th>
                  <th>Nome</th>
                  <th>Raça</th>
                  <th>Sexo</th>
                </tr>
              </thead>
              <tbody>
                {recentDogs.map(dog => (
                  <tr key={dog.id}>
                    <td><span className="reg-id">{dog.registration_id}</span></td>
                    <td>{dog.name}</td>
                    <td>{dog.breed_name || '—'}</td>
                    <td>{dog.gender === 'M' ? '♂ Macho' : '♀ Fêmea'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estatísticas de agentes */}
      {agentStats.length > 0 && (
        <div className="admin-section">
          <h2>📋 Registos por Agente (Mensal)</h2>
          <div className="agent-stats-list">
            {agentStats.slice(0, 10).map((item, idx) => (
              <div className="agent-stat-row" key={idx}>
                <span className="agent-name">{item.agent_full_name || item.agent_username}</span>
                <span className="agent-month">{item.month}</span>
                <span className="agent-count">{item.registrations} registos</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preços e Taxas */}
      <div className="admin-section">
        <h2>💰 Preços e Taxas</h2>
        {feesLoading ? (
          <p>A carregar preços...</p>
        ) : (
          <div className="fees-grid">
            <div className="fees-field">
              <label>🎫 Preço por Ticket (KZ)</label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 5000"
                value={fees.ticket_price}
                onChange={e => setFees(f => ({ ...f, ticket_price: e.target.value }))}
              />
              <small>Valor que o criador paga para comprar 1 ticket</small>
            </div>
            <div className="fees-field">
              <label>🐕 Taxa de Registo de Cão (KZ)</label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 3000"
                value={fees.dog_registration_fee}
                onChange={e => setFees(f => ({ ...f, dog_registration_fee: e.target.value }))}
              />
              <small>Custo em KZ para o criador registar 1 cão</small>
            </div>
            <div className="fees-field">
              <label>👶 Taxa de Registo de Ninhada (KZ)</label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 8000"
                value={fees.litter_registration_fee}
                onChange={e => setFees(f => ({ ...f, litter_registration_fee: e.target.value }))}
              />
              <small>Custo em KZ para o criador registar 1 ninhada / cruzamento</small>
            </div>
            <div className="fees-field">
              <label>👤 Taxa de Registo de Criador (KZ)</label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 10000"
                value={fees.breeder_registration_fee}
                onChange={e => setFees(f => ({ ...f, breeder_registration_fee: e.target.value }))}
              />
              <small>Custo em KZ para um novo criador se registar no sistema</small>
            </div>
          </div>
        )}
        {feesMessage && <p className="permission-message success">{feesMessage}</p>}
        {feesError && <p className="permission-message error">{feesError}</p>}
        <button
          className="fees-save-btn"
          onClick={handleSaveFees}
          disabled={feesSaving || feesLoading}
        >
          {feesSaving ? '💾 A guardar...' : '💾 Guardar Preços'}
        </button>
      </div>

      {/* Painel de Promoção */}
      <div className="admin-section">
        <h2>🎉 Painel de Promoção</h2>
        <div className="promo-admin-card">
          <div className="promo-admin-toggle-row">
            <div>
              <h3>Estado da Promoção</h3>
              <p className="promo-admin-hint">Quando ativo, o banner de promoção aparece para todos os utilizadores na página inicial.</p>
            </div>
            <div className="promo-admin-toggle-side">
              <button
                className={`toggle-switch ${promoEnabled ? 'active' : 'inactive'}`}
                onClick={handleTogglePromo}
              >
                <span className="toggle-circle"></span>
              </button>
              <span className={`permission-status ${promoEnabled ? 'status-on' : 'status-off'}`}>
                {promoEnabled ? '✅ ATIVO' : '🔒 INATIVO'}
              </span>
            </div>
          </div>

          {promoLoading ? (
            <p>A carregar dados da promoção...</p>
          ) : (
            <div className="promo-admin-fields">
              <div className="fees-field">
                <label>📢 Título da Promoção</label>
                <input
                  type="text"
                  placeholder="Ex: Promoção de Verão!"
                  value={promo.title}
                  onChange={e => setPromo(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="fees-field">
                <label>📝 Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Registo de cães com 50% de desconto durante este mês!"
                  value={promo.description}
                  onChange={e => setPromo(p => ({ ...p, description: e.target.value }))}
                  className="promo-admin-textarea"
                />
              </div>
              <div className="fees-field" style={{ maxWidth: '200px' }}>
                <label>🏷️ Desconto (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ex: 30"
                  value={promo.discount}
                  onChange={e => setPromo(p => ({ ...p, discount: e.target.value }))}
                />
              </div>
            </div>
          )}

          {promoMessage && <p className="permission-message success">{promoMessage}</p>}
          {promoError && <p className="permission-message error">{promoError}</p>}

          <button
            className="fees-save-btn"
            onClick={handleSavePromo}
            disabled={promoSaving || promoLoading}
          >
            {promoSaving ? '💾 A guardar...' : '💾 Guardar Promoção'}
          </button>
        </div>
      </div>

      {/* Funcionamento Técnico */}
      <div className="admin-section">
        <h2>⚙️ Funcionamento Técnico do Registo de Pedigree (RCA)</h2>
        <div className="tech-info-grid">

          <div className="tech-info-card">
            <div className="tech-info-header">
              <span className="tech-info-icon">📌</span>
              <h3>Base de Dados</h3>
            </div>
            <p>O RCA funciona com uma base de dados onde ficam guardadas todas as informações dos cães registados:</p>
            <ul>
              <li>Nome do cão</li>
              <li>Número de registo</li>
              <li>Raça</li>
              <li>Pais e antepassados</li>
            </ul>
            <p className="tech-info-nota">👉 É como um sistema informático que controla toda a linhagem.</p>
          </div>

          <div className="tech-info-card">
            <div className="tech-info-header">
              <span className="tech-info-icon">🔢</span>
              <h3>Identificação do Cão</h3>
            </div>
            <p>Cada cão é identificado de forma única através de:</p>
            <ul>
              <li>Número de registo</li>
              <li>Microchip (em muitos casos)</li>
            </ul>
            <p className="tech-info-nota">👉 Isso evita fraudes ou troca de animais.</p>
          </div>

          <div className="tech-info-card">
            <div className="tech-info-header">
              <span className="tech-info-icon">🧬</span>
              <h3>Controlo de Linhagem</h3>
            </div>
            <p>O sistema liga automaticamente:</p>
            <ul>
              <li>Filhote → Pais → Avós → Bisavós</li>
            </ul>
            <p className="tech-info-nota">👉 Assim é possível ver toda a árvore genealógica do cão.</p>
          </div>

          <div className="tech-info-card">
            <div className="tech-info-header">
              <span className="tech-info-icon">🧾</span>
              <h3>Emissão do Pedigree</h3>
            </div>
            <p>Depois do registo:</p>
            <ul>
              <li>O sistema gera o certificado (pedigree)</li>
              <li>Pode ser digital ou impresso</li>
            </ul>
            <p className="tech-info-nota">👉 Esse documento é oficial dentro do clube.</p>
          </div>

          <div className="tech-info-card">
            <div className="tech-info-header">
              <span className="tech-info-icon">🔍</span>
              <h3>Verificação e Validação</h3>
            </div>
            <p>O RCA pode fazer:</p>
            <ul>
              <li>Conferência dos dados dos pais</li>
              <li>Verificação de cruzamentos</li>
              <li>(Em alguns casos) testes de ADN</li>
            </ul>
            <p className="tech-info-nota">👉 Isso garante que a raça é verdadeira.</p>
          </div>

          <div className="tech-info-card">
            <div className="tech-info-header">
              <span className="tech-info-icon">🔄</span>
              <h3>Atualização de Dados</h3>
            </div>
            <p>O sistema permite:</p>
            <ul>
              <li>Transferir o cão para outro dono</li>
              <li>Atualizar informações</li>
              <li>Registar novas ninhadas</li>
            </ul>
            <p className="tech-info-nota">👉 O registo mantém-se sempre actualizado e fiável.</p>
          </div>

        </div>
      </div>

      {/* Como Funciona o Sistema do RCA */}
      <div className="admin-section">
        <h2>⚙️ Como Funciona o Sistema do RCA</h2>
        <div className="sistema-steps">

          <div className="sistema-step">
            <div className="sistema-step-num">1</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>📌</span><h3>Entrada de Dados</h3>
              </div>
              <p>O sistema começa quando o criador envia as informações:</p>
              <ul>
                <li>Dados dos pais</li>
                <li>Data de nascimento dos filhotes</li>
                <li>Quantidade de cães na ninhada</li>
              </ul>
              <p className="tech-info-nota">👉 Esses dados são inseridos no sistema do RCA.</p>
            </div>
          </div>

          <div className="sistema-step">
            <div className="sistema-step-num">2</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>🗄️</span><h3>Armazenamento</h3>
              </div>
              <p>O sistema guarda tudo numa base de dados:</p>
              <ul>
                <li>Cada cão fica registado</li>
                <li>As informações ficam ligadas entre si</li>
              </ul>
              <p className="tech-info-nota">👉 Funciona como um arquivo digital.</p>
            </div>
          </div>

          <div className="sistema-step">
            <div className="sistema-step-num">3</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>🔗</span><h3>Ligação de Linhagem</h3>
              </div>
              <p>O sistema conecta automaticamente:</p>
              <ul>
                <li>Filhote → Pai → Avô → Bisavô</li>
              </ul>
              <p className="tech-info-nota">👉 Isso cria a árvore genealógica do cão.</p>
            </div>
          </div>

          <div className="sistema-step">
            <div className="sistema-step-num">4</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>🔍</span><h3>Verificação Automática</h3>
              </div>
              <p>O sistema verifica:</p>
              <ul>
                <li>Se os pais estão registados</li>
                <li>Se os dados estão corretos</li>
                <li>Se o cruzamento é válido</li>
              </ul>
              <p className="tech-info-nota">👉 Isso evita erros e fraudes.</p>
            </div>
          </div>

          <div className="sistema-step">
            <div className="sistema-step-num">5</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>🧾</span><h3>Geração do Pedigree</h3>
              </div>
              <p>Depois de validado:</p>
              <ul>
                <li>O sistema cria o certificado</li>
                <li>Inclui todas as gerações do cão</li>
              </ul>
              <p className="tech-info-nota">👉 Esse documento é o pedigree oficial.</p>
            </div>
          </div>

          <div className="sistema-step">
            <div className="sistema-step-num">6</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>🔄</span><h3>Atualizações</h3>
              </div>
              <p>O sistema permite:</p>
              <ul>
                <li>Mudar o dono do cão</li>
                <li>Registar novos cruzamentos</li>
                <li>Atualizar dados</li>
              </ul>
              <p className="tech-info-nota">👉 O registo mantém-se sempre actualizado.</p>
            </div>
          </div>

          <div className="sistema-step sistema-step-destaque">
            <div className="sistema-step-num sistema-step-num-sec">7</div>
            <div className="sistema-step-body">
              <div className="sistema-step-header">
                <span>🔐</span><h3>Segurança</h3>
              </div>
              <p>Para proteger o sistema:</p>
              <ul>
                <li>Cada cão tem número único</li>
                <li>Pode ter microchip</li>
                <li>Alguns usam QR Code para confirmar autenticidade</li>
              </ul>
              <p className="tech-info-nota">👉 O sistema garante identidade fiável de cada animal.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
