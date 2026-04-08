import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './ParceiriasPage.css';

function ParceiriasPage({ user }) {
  const [partnerships, setPartnerships] = useState([]);
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [sendLoading, setSendLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('partners'); // 'partners' | 'received' | 'sent' | 'search'

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [partRes, breedersRes] = await Promise.all([
        api.get('/partnerships'),
        api.get('/partnerships/breeders'),
      ]);
      setPartnerships(partRes.data);
      setBreeders(breedersRes.data);
    } catch {
      setError('Erro ao carregar parcerias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };
  const showErr = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  // Aceitar pedido recebido
  const handleAccept = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'accept' }));
    try {
      await api.put(`/partnerships/${id}/accept`);
      setPartnerships(prev =>
        prev.map(p => p.id === id ? { ...p, status: 'accepted' } : p)
      );
      showMsg('✅ Parceria aceite!');
    } catch {
      showErr('Erro ao aceitar parceria.');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  // Recusar / cancelar / desfazer
  const handleRemove = async (id, label) => {
    if (!window.confirm(`${label}?\nEsta acção removerá a parceria permanentemente.`)) return;
    setActionLoading(prev => ({ ...prev, [id]: 'remove' }));
    try {
      await api.delete(`/partnerships/${id}`);
      setPartnerships(prev => prev.filter(p => p.id !== id));
      showMsg('✅ Parceria removida.');
    } catch {
      showErr('Erro ao remover parceria.');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  // Enviar pedido
  const handleSend = async (breederId) => {
    setSendLoading(breederId);
    try {
      const res = await api.post('/partnerships', { addressee_id: breederId });
      setPartnerships(prev => [...prev, {
        ...res.data,
        direction: 'sent',
        partner_id: breederId,
        partner_username: breeders.find(b => b.id === breederId)?.username,
        partner_full_name: breeders.find(b => b.id === breederId)?.full_name,
        partner_kennel: breeders.find(b => b.id === breederId)?.kennel_name,
        partner_city: breeders.find(b => b.id === breederId)?.city,
      }]);
      showMsg('✅ Pedido de parceria enviado!');
      setTab('sent');
    } catch (e) {
      showErr(e.response?.data?.error || 'Erro ao enviar pedido.');
    } finally {
      setSendLoading(null);
    }
  };

  // Derivados
  const accepted = partnerships.filter(p => p.status === 'accepted');
  const receivedPending = partnerships.filter(p => p.status === 'pending' && p.direction === 'received');
  const sentPending = partnerships.filter(p => p.status === 'pending' && p.direction === 'sent');

  // IDs que já têm relação (para esconder botão "Solicitar" na pesquisa)
  const relatedIds = new Set(partnerships.map(p => p.partner_id));

  const filteredBreeders = breeders.filter(b => {
    const q = searchTerm.toLowerCase();
    return (
      (b.full_name || '').toLowerCase().includes(q) ||
      (b.username || '').toLowerCase().includes(q) ||
      (b.kennel_name || '').toLowerCase().includes(q) ||
      (b.city || '').toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  };

  if (loading) {
    return (
      <div className="parceiras-container">
        <div className="parceiras-loading">
          <div className="parceiras-spinner"></div>
          <p>A carregar parcerias…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parceiras-container">
      {/* Cabeçalho */}
      <div className="parceiras-header">
        <h1>🤝 Parcerias de Canil</h1>
        <p>Estabeleça parcerias com outros criadores e anuncie o vosso canil parceiro.</p>
      </div>

      {message && <div className="parceiras-msg parceiras-msg--success">{message}</div>}
      {error && <div className="parceiras-msg parceiras-msg--error">{error}</div>}

      {/* Tabs */}
      <div className="parceiras-tabs">
        <button
          className={`ptab ${tab === 'partners' ? 'ptab--active' : ''}`}
          onClick={() => setTab('partners')}
        >
          🌟 Parceiros
          {accepted.length > 0 && <span className="ptab-badge">{accepted.length}</span>}
        </button>
        <button
          className={`ptab ${tab === 'received' ? 'ptab--active' : ''}`}
          onClick={() => setTab('received')}
        >
          📥 Recebidos
          {receivedPending.length > 0 && <span className="ptab-badge ptab-badge--alert">{receivedPending.length}</span>}
        </button>
        <button
          className={`ptab ${tab === 'sent' ? 'ptab--active' : ''}`}
          onClick={() => setTab('sent')}
        >
          📤 Enviados
          {sentPending.length > 0 && <span className="ptab-badge">{sentPending.length}</span>}
        </button>
        <button
          className={`ptab ${tab === 'search' ? 'ptab--active' : ''}`}
          onClick={() => setTab('search')}
        >
          🔍 Pesquisar Criadores
        </button>
      </div>

      {/* ── Parceiros Activos ── */}
      {tab === 'partners' && (
        <div className="parceiras-section">
          {accepted.length === 0 ? (
            <div className="parceiras-empty">
              <div className="pe-icon">🤝</div>
              <h3>Ainda sem parcerias activas</h3>
              <p>Pesquise criadores e envie o primeiro pedido de parceria.</p>
              <button className="btn-search-tab" onClick={() => setTab('search')}>
                🔍 Pesquisar criadores
              </button>
            </div>
          ) : (
            <div className="partnership-grid">
              {accepted.map(p => (
                <div key={p.id} className="partnership-card partnership-card--active">
                  <div className="pc-avatar">
                    <span>{getInitials(p.partner_full_name || p.partner_username)}</span>
                  </div>
                  <div className="pc-info">
                    <h3>{p.partner_full_name || p.partner_username}</h3>
                    <span className="pc-username">@{p.partner_username}</span>
                    {p.partner_kennel && (
                      <div className="pc-detail"><span>🏠</span> {p.partner_kennel}</div>
                    )}
                    {p.partner_city && (
                      <div className="pc-detail"><span>📍</span> {p.partner_city}{p.partner_province ? `, ${p.partner_province}` : ''}</div>
                    )}
                    <div className="pc-detail pc-detail--date">
                      <span>🤝</span> Parceiros desde {new Date(p.updated_at).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <div className="pc-actions">
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(p.id, 'Desfazer esta parceria')}
                      disabled={!!actionLoading[p.id]}
                    >
                      {actionLoading[p.id] === 'remove' ? '⏳' : '💔 Desfazer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pedidos Recebidos ── */}
      {tab === 'received' && (
        <div className="parceiras-section">
          {receivedPending.length === 0 ? (
            <div className="parceiras-empty">
              <div className="pe-icon">📭</div>
              <h3>Nenhum pedido recebido</h3>
              <p>Quando outro criador enviar um pedido de parceria, aparecerá aqui.</p>
            </div>
          ) : (
            <div className="partnership-grid">
              {receivedPending.map(p => (
                <div key={p.id} className="partnership-card partnership-card--pending">
                  <div className="pc-avatar pc-avatar--pending">
                    <span>{getInitials(p.partner_full_name || p.partner_username)}</span>
                  </div>
                  <div className="pc-info">
                    <h3>{p.partner_full_name || p.partner_username}</h3>
                    <span className="pc-username">@{p.partner_username}</span>
                    {p.partner_kennel && (
                      <div className="pc-detail"><span>🏠</span> {p.partner_kennel}</div>
                    )}
                    {p.partner_city && (
                      <div className="pc-detail"><span>📍</span> {p.partner_city}</div>
                    )}
                    {p.message && (
                      <div className="pc-message">💬 "{p.message}"</div>
                    )}
                    <div className="pc-detail pc-detail--date">
                      <span>🕒</span> Pedido a {new Date(p.created_at).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <div className="pc-actions pc-actions--row">
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(p.id)}
                      disabled={!!actionLoading[p.id]}
                    >
                      {actionLoading[p.id] === 'accept' ? '⏳' : '✅ Aceitar'}
                    </button>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(p.id, 'Recusar este pedido de parceria')}
                      disabled={!!actionLoading[p.id]}
                    >
                      {actionLoading[p.id] === 'remove' ? '⏳' : '❌ Recusar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pedidos Enviados ── */}
      {tab === 'sent' && (
        <div className="parceiras-section">
          {sentPending.length === 0 ? (
            <div className="parceiras-empty">
              <div className="pe-icon">📤</div>
              <h3>Nenhum pedido enviado</h3>
              <p>Os pedidos que enviar aparecerão aqui até serem aceites.</p>
              <button className="btn-search-tab" onClick={() => setTab('search')}>
                🔍 Pesquisar criadores
              </button>
            </div>
          ) : (
            <div className="partnership-grid">
              {sentPending.map(p => (
                <div key={p.id} className="partnership-card partnership-card--sent">
                  <div className="pc-avatar pc-avatar--sent">
                    <span>{getInitials(p.partner_full_name || p.partner_username)}</span>
                  </div>
                  <div className="pc-info">
                    <h3>{p.partner_full_name || p.partner_username}</h3>
                    <span className="pc-username">@{p.partner_username}</span>
                    {p.partner_kennel && (
                      <div className="pc-detail"><span>🏠</span> {p.partner_kennel}</div>
                    )}
                    <span className="pc-status-badge">⏳ Aguarda resposta</span>
                    <div className="pc-detail pc-detail--date">
                      <span>🕒</span> Enviado a {new Date(p.created_at).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <div className="pc-actions">
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(p.id, 'Cancelar este pedido de parceria')}
                      disabled={!!actionLoading[p.id]}
                    >
                      {actionLoading[p.id] === 'remove' ? '⏳' : '🗑️ Cancelar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pesquisa de Criadores ── */}
      {tab === 'search' && (
        <div className="parceiras-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Pesquisar por nome, username, canil ou cidade…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input-parceiras"
            />
          </div>

          {filteredBreeders.length === 0 ? (
            <div className="parceiras-empty">
              <div className="pe-icon">🐕</div>
              <h3>{searchTerm ? 'Nenhum criador encontrado' : 'Nenhum criador disponível'}</h3>
              <p>{searchTerm ? 'Tente outro termo de pesquisa.' : 'Não há outros criadores verificados no sistema.'}</p>
            </div>
          ) : (
            <div className="partnership-grid">
              {filteredBreeders.map(b => {
                const hasRelation = relatedIds.has(b.id);
                const relation = partnerships.find(p => p.partner_id === b.id);
                return (
                  <div key={b.id} className="partnership-card">
                    <div className="pc-avatar">
                      <span>{getInitials(b.full_name || b.username)}</span>
                    </div>
                    <div className="pc-info">
                      <h3>{b.full_name || b.username}</h3>
                      <span className="pc-username">@{b.username}</span>
                      {b.kennel_name && (
                        <div className="pc-detail"><span>🏠</span> {b.kennel_name}</div>
                      )}
                      {b.city && (
                        <div className="pc-detail"><span>📍</span> {b.city}{b.province ? `, ${b.province}` : ''}</div>
                      )}
                    </div>
                    <div className="pc-actions">
                      {!hasRelation && (
                        <button
                          className="btn-request"
                          onClick={() => handleSend(b.id)}
                          disabled={sendLoading === b.id}
                        >
                          {sendLoading === b.id ? '⏳ A enviar…' : '🤝 Solicitar'}
                        </button>
                      )}
                      {hasRelation && relation?.status === 'pending' && relation?.direction === 'sent' && (
                        <span className="pc-status-badge">⏳ Pedido enviado</span>
                      )}
                      {hasRelation && relation?.status === 'pending' && relation?.direction === 'received' && (
                        <span className="pc-status-badge pc-status-badge--green">📥 Pedido recebido</span>
                      )}
                      {hasRelation && relation?.status === 'accepted' && (
                        <span className="pc-status-badge pc-status-badge--green">✅ Parceiro activo</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ParceiriasPage;
