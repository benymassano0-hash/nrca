import React, { useState, useEffect } from 'react';
import api from '../api';
import './UsersManagementPage.css';

function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    breeders: 0,
    agents: 0,
    viewers: 0,
    verified: 0
  });
  const [breederForm, setBreederForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    kennel_name: '',
    city: '',
    province: ''
  });
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [creatingBreeder, setCreatingBreeder] = useState(false);
  const [agentForm, setAgentForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
    province: ''
  });
  const [agentMessage, setAgentMessage] = useState('');
  const [agentError, setAgentError] = useState('');
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [teamMonthlyStats, setTeamMonthlyStats] = useState([]);
  const [togglingBreeder, setTogglingBreeder] = useState(null);

  useEffect(() => {
    loadUsers();
    loadTeamMonthlyStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      
      // Calcular estatísticas
      const stats = {
        totalUsers: response.data.length,
        breeders: response.data.filter(u => u.user_type === 'breeder').length,
        agents: response.data.filter(u => u.user_type === 'registration_agent').length,
        viewers: response.data.filter(u => u.user_type === 'viewer').length,
        verified: response.data.filter(u => u.is_verified).length
      };
      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMonthlyStats = async () => {
    try {
      const response = await api.get('/users/agents/stats/monthly');
      setTeamMonthlyStats(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas da equipa:', error);
    }
  };

  const handleToggleVerification = async (userId, verified) => {
    try {
      await api.put(`/users/${userId}/verify`, { is_verified: verified });
      // Atualizar estado local sem recarregar tudo
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: verified } : u));
      setSelectedUser(prev => prev && prev.id === userId ? { ...prev, is_verified: verified } : prev);
    } catch (error) {
      console.error('Erro ao atualizar verificação:', error);
      alert('Não foi possível atualizar o estado de verificação. Tente novamente.');
    }
  };

  const handleBreederFormChange = (e) => {
    const { name, value } = e.target;
    setBreederForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBreeder = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setFormError('');
    setCreatingBreeder(true);

    try {
      const response = await api.post('/users/breeders', breederForm);
      setFormMessage(`Criador ${response.data.username} registado com sucesso.`);
      setBreederForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        kennel_name: '',
        city: '',
        province: ''
      });
      await loadUsers();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Não foi possível registar o criador.');
    } finally {
      setCreatingBreeder(false);
    }
  };

  const handleAgentFormChange = (e) => {
    const { name, value } = e.target;
    setAgentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setAgentMessage('');
    setAgentError('');
    setCreatingAgent(true);

    try {
      const response = await api.post('/users/agents', agentForm);
      setAgentMessage(`Agente ${response.data.username} registado com sucesso.`);
      setAgentForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        city: '',
        province: ''
      });
      await loadUsers();
    } catch (error) {
      setAgentError(error.response?.data?.error || 'Não foi possível registar o agente.');
    } finally {
      setCreatingAgent(false);
    }
  };

  const getUserTypeLabel = (userType) => {
    if (userType === 'breeder') return '🐕 Criador';
    if (userType === 'registration_agent') return '🗂️ Agente de Registo';
    if (userType === 'admin') return '🛡️ Admin';
    return '👓 Consultor';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || user.user_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const agentUsers = users
    .filter(user => user.user_type === 'registration_agent')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const agentNumberMap = new Map(
    agentUsers.map((user, index) => [user.id, `AG-${String(index + 1).padStart(3, '0')}`])
  );

  const breederUsers = users
    .filter(user => user.user_type === 'breeder')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const breederNumberMap = new Map(
    breederUsers.map((user, index) => [user.id, `CR-${String(index + 1).padStart(3, '0')}`])
  );

  const handleDeleteAgent = async (agent) => {
    const confirmed = window.confirm(`Eliminar agente ${agent.username}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/users/agents/${agent.id}`);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Não foi possível eliminar o agente.');
    }
  };

  const handleToggleBreederActive = async (breeder) => {
    setTogglingBreeder(breeder.id);
    try {
      const newStatus = !breeder.is_active;
      await api.put(`/users/${breeder.id}/toggle-active`, { is_active: newStatus });
      // Atualizar estado local
      setUsers(prev => prev.map(u => u.id === breeder.id ? { ...u, is_active: newStatus } : u));
      setSelectedUser(prev => prev && prev.id === breeder.id ? { ...prev, is_active: newStatus } : prev);
    } catch (error) {
      console.error('Erro ao fazer toggle de criador:', error);
      alert(error.response?.data?.error || 'Não foi possível alterar o estado do criador.');
    } finally {
      setTogglingBreeder(null);
    }
  };

  const handleSetDogLimit = async (breeder) => {
    const currentLimit = Number(breeder.dog_limit || 0);
    const input = window.prompt(
      `Definir limite de registos de cães para ${breeder.full_name || breeder.username}.\n\nLimite atual: ${currentLimit}\nDigite o novo limite (0 = sem limite).`,
      String(currentLimit)
    );

    if (input === null) return;

    const parsed = Number(input);
    if (!Number.isInteger(parsed) || parsed < 0) {
      alert('Digite um número inteiro igual ou maior que 0.');
      return;
    }

    try {
      const response = await api.put(`/users/${breeder.id}/dog-limit`, { dog_limit: parsed });
      const updatedUser = response.data;
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
      setSelectedUser((prev) => (prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev));
      alert('Limite atualizado com sucesso.');
    } catch (error) {
      alert(error.response?.data?.error || 'Não foi possível atualizar o limite do criador.');
    }
  };

  const handleCreditBreederTickets = async (breeder) => {
    const ticketsInput = window.prompt(
      `Carregar tickets para ${breeder.full_name || breeder.username}.\n\nTickets atuais: ${Number(breeder.tickets || 0)}\nDigite a quantidade de tickets:`
    );

    if (ticketsInput === null) return;

    const parsedTickets = Number(String(ticketsInput).trim());
    if (!Number.isInteger(parsedTickets) || parsedTickets <= 0) {
      alert('Digite um número inteiro maior que zero.');
      return;
    }

    const note = window.prompt('Nota do carregamento (opcional):', 'Carregamento manual de tickets pelo admin') || '';

    try {
      const response = await api.post(`/users/${breeder.id}/credit-tickets`, {
        tickets: parsedTickets,
        note,
      });
      const updatedUser = response.data.user;
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
      setSelectedUser((prev) => (prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev));
      alert(`Tickets carregados com sucesso: ${parsedTickets}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Não foi possível carregar tickets do criador.');
    }
  };

  const handleDebitBreederTickets = async (breeder) => {
    const ticketsInput = window.prompt(
      `Retirar tickets de ${breeder.full_name || breeder.username}.\n\nTickets atuais: ${Number(breeder.tickets || 0)}\nDigite a quantidade de tickets a retirar:`
    );

    if (ticketsInput === null) return;

    const parsedTickets = Number(String(ticketsInput).trim());
    if (!Number.isInteger(parsedTickets) || parsedTickets <= 0) {
      alert('Digite um número inteiro maior que zero.');
      return;
    }

    if (parsedTickets > Number(breeder.tickets || 0)) {
      alert('O valor a retirar não pode ser maior que os tickets atuais do criador.');
      return;
    }

    const note = window.prompt('Nota do débito (opcional):', 'Débito manual de tickets pelo admin') || '';

    try {
      const response = await api.post(`/users/${breeder.id}/debit-tickets`, {
        tickets: parsedTickets,
        note,
      });
      const updatedUser = response.data.user;
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
      setSelectedUser((prev) => (prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev));
      alert(`Tickets retirados com sucesso: ${parsedTickets}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Não foi possível retirar tickets do criador.');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Username', 'Email', 'PIN', 'Nome Completo', 'Tipo', 'Telefone', 'Cidade', 'Verificado', 'Data Registo'];
    const rows = users.map(user => [
      user.id,
      user.username,
      user.email,
      user.login_pin || '-',
      user.full_name || '-',
      user.user_type,
      user.phone || '-',
      user.city || '-',
      user.is_verified ? 'Sim' : 'Não',
      new Date(user.created_at).toLocaleDateString('pt-PT')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_rca_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="card"><p>Carregando usuários...</p></div>;
  }

  return (
    <div className="users-management-container">
      <div className="management-header">
        <h1>👥 Gerenciamento de Usuários</h1>
        <p>Total de {users.length} utilizadores registados no sistema</p>
      </div>

      <div className="create-breeder-card">
        <h2>➕ Registar Criador</h2>
        <p>Crie contas de criadores diretamente pela equipa de cadastro.</p>

        {formMessage && <div className="form-success">{formMessage}</div>}
        {formError && <div className="form-error">{formError}</div>}

        <form className="create-breeder-form" onSubmit={handleCreateBreeder}>
          <input
            name="username"
            placeholder="Username*"
            value={breederForm.username}
            onChange={handleBreederFormChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email*"
            value={breederForm.email}
            onChange={handleBreederFormChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Senha provisória*"
            value={breederForm.password}
            onChange={handleBreederFormChange}
            required
          />
          <input
            name="full_name"
            placeholder="Nome completo"
            value={breederForm.full_name}
            onChange={handleBreederFormChange}
          />
          <input
            name="phone"
            placeholder="Telefone"
            value={breederForm.phone}
            onChange={handleBreederFormChange}
          />
          <input
            name="kennel_name"
            placeholder="Nome do Canil"
            value={breederForm.kennel_name}
            onChange={handleBreederFormChange}
          />
          <input
            name="city"
            placeholder="Cidade"
            value={breederForm.city}
            onChange={handleBreederFormChange}
          />
          <input
            name="province"
            placeholder="Província"
            value={breederForm.province}
            onChange={handleBreederFormChange}
          />

          <button type="submit" className="create-breeder-btn" disabled={creatingBreeder}>
            {creatingBreeder ? 'A criar...' : 'Registar Criador'}
          </button>
        </form>
      </div>

      <div className="create-agent-card">
        <h2>🗂️ Registar Agente de Registo</h2>
        <p>Somente o admin pode criar agentes para trabalhar na plataforma.</p>

        {agentMessage && <div className="form-success">{agentMessage}</div>}
        {agentError && <div className="form-error">{agentError}</div>}

        <form className="create-breeder-form" onSubmit={handleCreateAgent}>
          <input
            name="username"
            placeholder="Username*"
            value={agentForm.username}
            onChange={handleAgentFormChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email*"
            value={agentForm.email}
            onChange={handleAgentFormChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Senha provisória*"
            value={agentForm.password}
            onChange={handleAgentFormChange}
            required
          />
          <input
            name="full_name"
            placeholder="Nome completo"
            value={agentForm.full_name}
            onChange={handleAgentFormChange}
          />
          <input
            name="phone"
            placeholder="Telefone"
            value={agentForm.phone}
            onChange={handleAgentFormChange}
          />
          <input
            name="city"
            placeholder="Cidade"
            value={agentForm.city}
            onChange={handleAgentFormChange}
          />
          <input
            name="province"
            placeholder="Província"
            value={agentForm.province}
            onChange={handleAgentFormChange}
          />

          <button type="submit" className="create-agent-btn" disabled={creatingAgent}>
            {creatingAgent ? 'A criar...' : 'Registar Agente'}
          </button>
        </form>
      </div>

      <div className="team-panel-card">
        <h2>📊 Painel de Equipa</h2>
        <p>Quantidade de pessoas que cada agente registou por mês.</p>
        {teamMonthlyStats.length === 0 ? (
          <p className="no-results">Sem dados de registos por agente ainda.</p>
        ) : (
          <table className="team-panel-table">
            <thead>
              <tr>
                <th>Nº Agente</th>
                <th>Agente</th>
                <th>Mês</th>
                <th>Pessoas Registadas</th>
              </tr>
            </thead>
            <tbody>
              {teamMonthlyStats.map((item, index) => (
                <tr key={`${item.agent_id}-${item.month}-${index}`}>
                  <td>{agentNumberMap.get(item.agent_id) || '-'}</td>
                  <td>{item.agent_full_name || item.agent_username}</td>
                  <td>{item.month}</td>
                  <td>{item.registrations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total de Usuários</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🐕</div>
          <div className="stat-content">
            <h3>{stats.breeders}</h3>
            <p>Criadores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👓</div>
          <div className="stat-content">
            <h3>{stats.agents}</h3>
            <p>Agentes de Registo</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👓</div>
          <div className="stat-content">
            <h3>{stats.viewers}</h3>
            <p>Consultores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.verified}</h3>
            <p>Verificados</p>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nome, email ou username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos ({users.length})
          </button>
          <button 
            className={`filter-btn ${filterType === 'breeder' ? 'active' : ''}`}
            onClick={() => setFilterType('breeder')}
          >
            Criadores
          </button>
          <button 
            className={`filter-btn ${filterType === 'viewer' ? 'active' : ''}`}
            onClick={() => setFilterType('viewer')}
          >
            Consultores
          </button>
          <button 
            className={`filter-btn ${filterType === 'registration_agent' ? 'active' : ''}`}
            onClick={() => setFilterType('registration_agent')}
          >
            Agentes
          </button>
        </div>

        <button className="export-btn" onClick={exportToCSV}>
          📥 Exportar CSV
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <p className="no-results">Nenhum usuário encontrado.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Username</th>
                <th>Email</th>
                <th>PIN</th>
                <th>Nome Completo</th>
                <th>Canil</th>
                <th>Tipo</th>
                <th>Cidade</th>
                <th>Limite Cães</th>
                <th>Tickets</th>
                <th>Status</th>
                <th>Data Registo</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="user-row">
                  <td className="number-col">
                    {user.user_type === 'registration_agent' && agentNumberMap.get(user.id)}
                    {user.user_type === 'breeder' && breederNumberMap.get(user.id)}
                    {user.user_type === 'admin' && '👑'}
                    {user.user_type === 'viewer' && '-'}
                  </td>
                  <td className="username-col">
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.login_pin || '-'}</td>
                  <td>{user.full_name || '-'}</td>
                  <td>{user.kennel_name || '-'}</td>
                  <td>
                    <span className={`badge badge-${user.user_type}`}>
                      {getUserTypeLabel(user.user_type)}
                    </span>
                  </td>
                  <td>{user.city || '-'}</td>
                  <td>{user.user_type === 'breeder' ? Number(user.dog_limit || 0) : '-'}</td>
                  <td>{user.user_type === 'breeder' ? Number(user.tickets || 0) : '-'}</td>
                  <td>
                    <span className={`status ${user.is_verified ? 'verified' : 'unverified'}`}>
                      {user.is_verified ? '✅ Verificado' : '⏳ Pendente'}
                    </span>
                  </td>
                  <td className="date-col">
                    {new Date(user.created_at).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="actions-col">
                    <button 
                      className="view-btn"
                      onClick={() => setSelectedUser(user)}
                    >
                      👁️ Ver
                    </button>
                    {user.user_type === 'breeder' && (
                      <>
                        <button
                          className="view-btn"
                          onClick={() => handleSetDogLimit(user)}
                          title="Definir limite de cães"
                        >
                          🎯 Limite
                        </button>
                        <button
                          className="view-btn"
                          onClick={() => handleCreditBreederTickets(user)}
                          title="Carregar tickets"
                        >
                          🎟️ Tickets
                        </button>
                        <button
                          className="view-btn"
                          onClick={() => handleDebitBreederTickets(user)}
                          title="Retirar tickets"
                        >
                          ➖ Tickets
                        </button>
                      </>
                    )}
                    {user.user_type === 'breeder' && (
                      <button
                        className={`toggle-breeder-btn ${user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleBreederActive(user)}
                        disabled={togglingBreeder === user.id}
                        title={user.is_active ? 'Desativar criador' : 'Ativar criador'}
                      >
                        {togglingBreeder === user.id ? '⏳' : (user.is_active ? '⚡' : '🔒')}
                      </button>
                    )}
                    {user.user_type === 'registration_agent' && (
                      <button
                        className="delete-agent-btn"
                        onClick={() => handleDeleteAgent(user)}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
            
            <div className="modal-header">
              <div className="user-avatar">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-title">
                <h2>{selectedUser.full_name || selectedUser.username}</h2>
                <p className="username">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>Informações de Contacto</h3>
                <div className="info-item">
                  <label>📧 Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="info-item">
                  <label>🔑 PIN:</label>
                  <span>{selectedUser.login_pin || '-'}</span>
                </div>
                <div className="info-item">
                  <label>📱 Telefone:</label>
                  <span>{selectedUser.phone || '-'}</span>
                </div>
                <div className="info-item">
                  <label>🏡 Canil:</label>
                  <span>{selectedUser.kennel_name || '-'}</span>
                </div>
                <div className="info-item">
                  <label>📍 Endereço:</label>
                  <span>{selectedUser.address || '-'}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Localização</h3>
                <div className="info-item">
                  <label>🏙️ Cidade:</label>
                  <span>{selectedUser.city || '-'}</span>
                </div>
                <div className="info-item">
                  <label>🗺️ Província:</label>
                  <span>{selectedUser.province || '-'}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Status na Plataforma</h3>
                <div className="info-item">
                  <label>Nº do Agente:</label>
                  <span>{agentNumberMap.get(selectedUser.id) || '-'}</span>
                </div>
                {selectedUser.user_type === 'breeder' && (
                  <>
                    <div className="info-item">
                      <label>🎯 Limite de cães:</label>
                      <span>{Number(selectedUser.dog_limit || 0)}</span>
                    </div>
                    <div className="info-item">
                      <label>🎟️ Tickets:</label>
                      <span>{Number(selectedUser.tickets || 0)}</span>
                    </div>
                  </>
                )}
                <div className="info-item">
                  <label>Tipo de Conta:</label>
                  <span className={`badge badge-${selectedUser.user_type}`}>
                    {getUserTypeLabel(selectedUser.user_type)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Verificado:</label>
                  <span className={selectedUser.is_verified ? 'verified' : 'unverified'}>
                    {selectedUser.is_verified ? '✅ Sim' : '⏳ Não'}
                  </span>
                </div>
                <div className="info-item">
                  <label>📅 Data de Registo:</label>
                  <span>{new Date(selectedUser.created_at).toLocaleDateString('pt-PT')} às {new Date(selectedUser.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedUser.is_verified ? (
                <button
                  className="btn-revoke"
                  onClick={() => handleToggleVerification(selectedUser.id, false)}
                >
                  ❌ Revogar
                </button>
              ) : (
                <button
                  className="btn-approve"
                  onClick={() => handleToggleVerification(selectedUser.id, true)}
                >
                  ✅ Aprovar
                </button>
              )}
              {selectedUser.user_type === 'breeder' && (
                <button
                  className="btn-primary"
                  onClick={() => handleSetDogLimit(selectedUser)}
                >
                  🎯 Definir Limite
                </button>
              )}
              {selectedUser.user_type === 'breeder' && (
                <button
                  className="btn-primary"
                  onClick={() => handleCreditBreederTickets(selectedUser)}
                >
                  🎟️ Carregar Tickets
                </button>
              )}
              {selectedUser.user_type === 'breeder' && (
                <button
                  className="btn-primary"
                  onClick={() => handleDebitBreederTickets(selectedUser)}
                >
                  ➖ Retirar Tickets
                </button>
              )}
              {selectedUser.user_type === 'breeder' && (
                <button
                  className={`btn-toggle-breeder ${selectedUser.is_active ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleBreederActive(selectedUser)}
                  disabled={togglingBreeder === selectedUser.id}
                >
                  {togglingBreeder === selectedUser.id ? '⏳ A processar...' : (selectedUser.is_active ? '⚡ Desativar Criador' : '🔓 Ativar Criador')}
                </button>
              )}
              {selectedUser.user_type === 'registration_agent' && (
                <button
                  className="btn-delete-agent"
                  onClick={() => handleDeleteAgent(selectedUser)}
                >
                  🗑️ Eliminar Agente
                </button>
              )}
              <button className="btn-primary" onClick={() => setSelectedUser(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagementPage;
