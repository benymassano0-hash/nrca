import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './PendingApprovalsPage.css';

function PendingApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      const pendingUsers = res.data.filter(u => !u.is_verified && u.user_type !== 'admin');
      setPending(pendingUsers);
    } catch (err) {
      setError('Erro ao carregar pedidos pendentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'approve' }));
    try {
      await api.put(`/users/${userId}/verify`, { is_verified: true });
      setPending(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('Erro ao aprovar conta. Tente novamente.');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[userId]; return n; });
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Recusar e eliminar a conta de "${user.full_name || user.username}"?\nEsta acção é irreversível.`)) return;
    setActionLoading(prev => ({ ...prev, [user.id]: 'reject' }));
    try {
      await api.delete(`/users/${user.id}`);
      setPending(prev => prev.filter(u => u.id !== user.id));
    } catch {
      alert('Erro ao eliminar conta. Tente novamente.');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[user.id]; return n; });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getInitials = (user) => {
    const name = user.full_name || user.username || '?';
    return name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  };

  if (loading) {
    return (
      <div className="approvals-container">
        <div className="approvals-loading">
          <div className="loading-spinner"></div>
          <p>A carregar pedidos pendentes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-container">
      {/* Cabeçalho */}
      <div className="approvals-header">
        <div className="approvals-header-left">
          <Link to="/admin" className="back-link">← Painel Admin</Link>
          <h1>
            🕐 Pedidos de Aprovação
            {pending.length > 0 && (
              <span className="pending-badge">{pending.length}</span>
            )}
          </h1>
          <p>Contas registadas a aguardar verificação pelo administrador.</p>
        </div>
        <button className="refresh-btn" onClick={loadPending} title="Recarregar lista">
          🔄 Atualizar
        </button>
      </div>

      {error && <div className="approvals-error">{error}</div>}

      {/* Estado vazio */}
      {pending.length === 0 ? (
        <div className="approvals-empty">
          <div className="empty-icon">✅</div>
          <h2>Tudo em dia!</h2>
          <p>Não há contas pendentes de aprovação neste momento.</p>
          <Link to="/admin/usuarios" className="link-to-users">Ver todos os utilizadores →</Link>
        </div>
      ) : (
        <>
          <p className="approvals-count-info">
            {pending.length === 1
              ? '1 conta aguarda aprovação'
              : `${pending.length} contas aguardam aprovação`}
          </p>

          <div className="approvals-grid">
            {pending.map(user => {
              const busy = actionLoading[user.id];
              return (
                <div key={user.id} className={`approval-card ${busy ? 'approval-card--busy' : ''}`}>
                  {/* Avatar */}
                  <div className="approval-avatar">
                    <span className="avatar-initials">{getInitials(user)}</span>
                  </div>

                  {/* Info */}
                  <div className="approval-info">
                    <h3 className="approval-name">{user.full_name || '(sem nome)'}</h3>
                    <span className="approval-username">@{user.username}</span>

                    <div className="approval-details">
                      {user.email && (
                        <div className="detail-row">
                          <span className="detail-icon">✉️</span>
                          <span>{user.email}</span>
                        </div>
                      )}
                      {user.canil_name && (
                        <div className="detail-row">
                          <span className="detail-icon">🏠</span>
                          <span>{user.canil_name}</span>
                        </div>
                      )}
                      {user.city && (
                        <div className="detail-row">
                          <span className="detail-icon">📍</span>
                          <span>{user.city}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="detail-row">
                          <span className="detail-icon">📞</span>
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-icon">🕒</span>
                        <span>Registado em {formatDate(user.created_at)}</span>
                      </div>
                    </div>

                    {/* Tipo */}
                    <span className="user-type-badge">
                      {user.user_type === 'breeder' ? '🐕 Criador' :
                       user.user_type === 'registration_agent' ? '📋 Agente' :
                       user.user_type}
                    </span>
                  </div>

                  {/* Acções */}
                  <div className="approval-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(user.id)}
                      disabled={!!busy}
                    >
                      {busy === 'approve' ? '⏳ A aprovar…' : '✅ Aprovar'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(user)}
                      disabled={!!busy}
                    >
                      {busy === 'reject' ? '⏳ A recusar…' : '❌ Recusar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default PendingApprovalsPage;
