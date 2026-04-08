import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './EventGallery.css';

function EventGallery() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados de eventos institucionais
  const institutionalEvents = [
    {
      id: 'inst-1',
      title: 'Exposição Canina de Luanda 2026',
      date: '15 de Março de 2026',
      event_date: '2026-03-15',
      location: 'Estádio 11 de Novembro, Luanda',
      image: 'https://images.unsplash.com/photo-1587300411515-3a8b4467e59d?w=500&h=300&fit=crop',
      video: null,
      description: 'Maior exposição canina de Angola com participação de cães de todas as raças registadas.',
      category: 'Exposição',
      is_institutional: true,
    },
    {
      id: 'inst-2',
      title: 'Campeonato de Obediência - Benguela',
      date: '22 de Março de 2026',
      event_date: '2026-03-22',
      location: 'Benguela, Angola',
      image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=500&h=300&fit=crop',
      video: null,
      description: 'Competição de obediência para cães treinados. Teste de habilidades e disciplina.',
      category: 'Competição',
      is_institutional: true,
    },
    {
      id: 'inst-3',
      title: 'Semana da Canicultura - Huambo',
      date: '5 a 10 de Abril de 2026',
      event_date: '2026-04-05',
      location: 'Huambo, Angola',
      image: 'https://images.unsplash.com/photo-1601758228658-3bda181e4a7e?w=500&h=300&fit=crop',
      video: null,
      description: 'Semana inteira dedicada à educação, saúde e bem-estar de cães. Workshops e palestras.',
      category: 'Evento Educativo',
      is_institutional: true,
    },
    {
      id: 'inst-4',
      title: 'Gala de Criadores Angolanos',
      date: '20 de Abril de 2026',
      event_date: '2026-04-20',
      location: 'Centro de Convenções, Luanda',
      image: 'https://images.unsplash.com/photo-1587300411515-3a8b4467e59d?w=500&h=300&fit=crop',
      video: null,
      description: 'Encontro anual de criadores para discutir padrões de raça e boas práticas.',
      category: 'Encontro Profissional',
      is_institutional: true,
    },
    {
      id: 'inst-5',
      title: 'Prova de Agilidade - Cabinda',
      date: '10 de Maio de 2026',
      event_date: '2026-05-10',
      location: 'Cabinda, Angola',
      image: 'https://images.unsplash.com/photo-1601758176406-be60fbccb6fa?w=500&h=300&fit=crop',
      video: null,
      description: 'Provas de agilidade para testar velocidade, inteligência e cooperação dos cães.',
      category: 'Competição',
      is_institutional: true,
    },
    {
      id: 'inst-6',
      title: 'Show de Filhotes - Lubango',
      date: '25 de Maio de 2026',
      event_date: '2026-05-25',
      location: 'Lubango, Angola',
      image: 'https://images.unsplash.com/photo-1633722715463-d30628dea330?w=500&h=300&fit=crop',
      video: null,
      description: 'Exposição especial para filhotes. Evento familiar com atividades para crianças.',
      category: 'Exposição',
      is_institutional: true,
    },
  ];

  const categories = ['Todas', 'Exposição', 'Competição', 'Evento Educativo', 'Encontro Profissional', 'Show de Filhotes', 'Outro'];
  const [filter, setFilter] = useState('Todas');

  // Carregar eventos publicados da API
  useEffect(() => {
    const loadPublishedEvents = async () => {
      try {
        const response = await api.get('/events/published');
        // Transformar eventos da API para o formato esperado
        const apiEvents = response.data.map(event => ({
          ...event,
          date: new Date(event.event_date).toLocaleDateString('pt-pt'),
          image: event.image_url || 'https://images.unsplash.com/photo-1587300411515-3a8b4467e59d?w=500&h=300&fit=crop',
          is_institutional: false,
          creator_name: event.full_name || event.username
        }));
        setPublishedEvents(apiEvents);
      } catch (error) {
        console.error('Erro ao carregar eventos publicados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPublishedEvents();
  }, []);

  // Combinar eventos institucionais com eventos de criadores
  const allEvents = [...institutionalEvents, ...publishedEvents];

  const filteredEvents = filter === 'Todas' 
    ? allEvents 
    : allEvents.filter(event => event.category === filter);

  return (
    <div className="event-gallery-container">
      <div className="event-header">
        <h2>🎪 Eventos de Canicultura em Angola</h2>
        <p>Participe nos principais eventos de criação e exposição de cães. Criadores: anunciem seus eventos aqui!</p>
      </div>

      {/* Botão para criar evento */}
      <div className="create-event-banner">
        <p>📢 É criador? Anuncie seu evento de canicultura na plataforma!</p>
        <Link to="/anunciar-evento" className="btn-create-event">
          ➕ Criar Meu Evento
        </Link>
      </div>

      {/* Filtros de Categoria */}
      <div className="event-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grade de Eventos */}
      <div className="events-grid">
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Carregando eventos...</p>
        ) : filteredEvents.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Nenhum evento encontrado nesta categoria.</p>
        ) : (
          filteredEvents.map(event => (
            <div 
              key={event.id} 
              className={`event-card ${event.is_institutional ? 'institutional' : 'creator'}`}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="event-image-container">
                <img src={event.image} alt={event.title} className="event-image" />
                <div className="event-category-badge">{event.category}</div>
                {!event.is_institutional && <div className="event-creator-badge">👤 {event.creator_name}</div>}
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-date">📅 {event.date}</p>
                <p className="event-location">📍 {event.location}</p>
                <p className="event-description">{event.description}</p>
                <button className="details-btn">Ver Detalhes →</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
            
            <div className="event-modal-header">
              <img src={selectedEvent.image} alt={selectedEvent.title} />
              <div className="event-modal-badges">
                <div className="event-modal-category">{selectedEvent.category}</div>
                {!selectedEvent.is_institutional && (
                  <div className="event-modal-creator">👤 {selectedEvent.creator_name}</div>
                )}
              </div>
            </div>

            <div className="event-modal-content">
              <h2>{selectedEvent.title}</h2>
              
              <div className="event-modal-info">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <div className="event-modal-description">
                <h3>Sobre o Evento</h3>
                <p>{selectedEvent.description}</p>
              </div>

              <div className="event-modal-actions">
                <button className="btn-primary">Registar Interesse</button>
                <button className="btn-secondary">Partilhar Evento</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chamada para ação */}
      <div className="event-cta">
        <h3>Quer organizar um evento de canicultura?</h3>
        <p>Criadores e organizadores podem anunciar seus eventos na plataforma RCA gratuitamente</p>
        <Link to="/anunciar-evento" className="cta-btn">📢 Anunciar Meu Evento</Link>
      </div>
    </div>
  );
}

export default EventGallery;
