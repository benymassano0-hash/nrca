import React, { useState, useEffect } from 'react';
import api from '../api';
import './AnunciarEventoPage.css';

function AnunciarEventoPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Exposição',
    event_date: '',
    event_time: '',
    location: '',
    province: '',
    image_url: '',
    video_url: '',
    max_attendees: ''
  });

  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const provinces = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
    'Namibe', 'Uíge', 'Zaire'
  ];

  const categories = [
    'Exposição', 'Competição', 'Evento Educativo',
    'Encontro Profissional', 'Show de Filhotes', 'Outro'
  ];

  // Carregar eventos do criador
  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/my-events');
      setMyEvents(response.data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar evento existing
        await api.put(`/events/${editingId}`, formData);
        setMessage('✅ Evento atualizado com sucesso!');
        setEditingId(null);
      } else {
        // Criar novo evento
        const response = await api.post('/events/create', formData);
        setMessage('✅ ' + response.data.message);
      }

      // Limpar formulário
      setFormData({
        title: '',
        description: '',
        category: 'Exposição',
        event_date: '',
        event_time: '',
        location: '',
        province: '',
        image_url: '',
        video_url: '',
        max_attendees: ''
      });

      // Recarregar eventos
      setTimeout(() => {
        loadMyEvents();
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage('❌ Erro: ' + (error.response?.data?.error || 'Erro ao salvar evento'));
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/publish`);
      setMessage('✅ Evento enviado para aprovação!');
      setTimeout(() => {
        loadMyEvents();
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage('❌ Erro: ' + (error.response?.data?.error || 'Erro ao publicar'));
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      event_date: event.event_date,
      event_time: event.event_time || '',
      location: event.location,
      province: event.province,
      image_url: event.image_url || '',
      video_url: event.video_url || '',
      max_attendees: event.max_attendees || ''
    });
    setEditingId(event.id);
    window.scrollTo(0, 0);
  };

  const handleCancel = async (eventId) => {
    if (window.confirm('Tem a certeza que quer cancelar este evento?')) {
      try {
        await api.put(`/events/${eventId}/cancel`);
        loadMyEvents();
        setMessage('✅ Evento cancelado com sucesso!');
      } catch (error) {
        setMessage('❌ Erro ao cancelar evento');
      }
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Tem a certeza que quer deletar este evento?')) {
      try {
        await api.delete(`/events/${eventId}`);
        loadMyEvents();
        setMessage('✅ Evento deletado com sucesso!');
      } catch (error) {
        setMessage('❌ Erro ao deletar evento');
      }
    }
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Exposição',
      event_date: '',
      event_time: '',
      location: '',
      province: '',
      image_url: '',
      video_url: '',
      max_attendees: ''
    });
    setEditingId(null);
  };

  return (
    <div className="anunciar-evento-container">
      <div className="anunciar-header">
        <h1>📢 Anunciar Evento de Canicultura</h1>
        <p>Partilhe sua exposição, competição ou evento com a comunidade RCA</p>
      </div>

      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <div className="anunciar-content">
        {/* Formulário */}
        <div className="anunciar-form-section">
          <h2>{editingId ? '✏️ Editar Evento' : '➕ Novo Evento'}</h2>
          <form onSubmit={handleSubmit} className="anunciar-form">
            <div className="form-row">
              <div className="form-group">
                <label>Título do Evento *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Exposição Canina de Luanda"
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Localização *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  placeholder="Ex: Estádio 11 de Novembro"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Província *</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {provinces.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descrição Detalhada</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o seu evento, incluindo atividades, participantes esperados..."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>URL da Imagem</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label>URL do Vídeo (YouTube/Vimeo)</label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Número Máximo de Participantes</label>
              <input
                type="number"
                name="max_attendees"
                value={formData.max_attendees}
                onChange={handleChange}
                placeholder="Ex: 500"
                min="0"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit">
                {editingId ? '💾 Atualizar Evento' : '➕ Criar Evento'}
              </button>
              {editingId && (
                <button type="button" className="btn-cancel" onClick={handleClearForm}>
                  ✕ Cancelar Edição
                </button>
              )}
            </div>

            <div className="form-info">
              <p>ℹ️  Seu evento será criado em <strong>rascunho</strong>.</p>
              <p>Depois de confirmar, será enviado para <strong>aprovação do administrador</strong>.</p>
              <p>Após aprovação, ficará visível para toda a comunidade!</p>
            </div>
          </form>
        </div>

        {/* Lista de Eventos */}
        <div className="meus-eventos-section">
          <h2>📅 Meus Eventos ({myEvents.length})</h2>

          {loading ? (
            <p>Carregando...</p>
          ) : myEvents.length === 0 ? (
            <p className="empty-message">Você ainda não tem eventos. Crie sua primeiro evento acima!</p>
          ) : (
            <div className="eventos-list">
              {myEvents.map(event => (
                <div key={event.id} className={`evento-item status-${event.status}`}>
                  <div className="evento-header">
                    <div className="evento-title-section">
                      <h3>{event.title}</h3>
                      <div className="evento-badges">
                        <span className={`badge status-${event.status}`}>{event.status}</span>
                        {event.is_approved ? (
                          <span className="badge approved">✅ Aprovado</span>
                        ) : (
                          <span className="badge pending">⏳ Pendente</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="evento-details">
                    <p>📁 <strong>Categoria:</strong> {event.category}</p>
                    <p>📅 <strong>Data:</strong> {new Date(event.event_date).toLocaleDateString('pt-pt')} {event.event_time && `às ${event.event_time}`}</p>
                    <p>📍 <strong>Local:</strong> {event.location}, {event.province}</p>
                    {event.description && <p>📝 <strong>Descrição:</strong> {event.description.substring(0, 100)}...</p>}
                  </div>

                  <div className="evento-actions">
                    {event.status === 'draft' && (
                      <>
                        <button className="btn-edit" onClick={() => handleEdit(event)}>✏️ Editar</button>
                        <button className="btn-publish" onClick={() => handlePublish(event.id)}>📤 Publicar</button>
                        <button className="btn-delete" onClick={() => handleDelete(event.id)}>🗑️ Deletar</button>
                      </>
                    )}
                    {event.status === 'published' && (
                      <>
                        <button className="btn-edit" onClick={() => handleEdit(event)}>✏️ Editar</button>
                        <button className="btn-cancel" onClick={() => handleCancel(event.id)}>❌ Cancelar</button>
                      </>
                    )}
                    {event.status === 'completed' && (
                      <p className="status-text">✅ Evento concluído</p>
                    )}
                    {event.status === 'cancelled' && (
                      <p className="status-text">❌ Evento cancelado</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnunciarEventoPage;
