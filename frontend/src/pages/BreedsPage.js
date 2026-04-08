import React, { useState, useEffect } from 'react';
import api from '../api';

function BreedsPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = currentUser?.user_type === 'admin';
  const [breeds, setBreeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importingWorld, setImportingWorld] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    origin: '',
    characteristics: '',
    min_weight: '',
    max_weight: '',
  });

  useEffect(() => {
    loadBreeds();
  }, []);

  const loadBreeds = async () => {
    try {
      const response = await api.get('/breeds');
      setBreeds(response.data);
    } catch (err) {
      setError('Erro ao carregar raças');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/breeds', formData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        origin: '',
        characteristics: '',
        min_weight: '',
        max_weight: '',
      });
      loadBreeds();
      setSuccess('Raça adicionada com sucesso.');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar raça');
    }
  };

  const handleImportWorldBreeds = async () => {
    setError('');
    setSuccess('');
    setImportingWorld(true);

    try {
      const response = await api.post('/breeds/import-world');
      setSuccess(`Importação concluída. Novas: ${response.data.inserted}, já existentes: ${response.data.skipped_existing}.`);
      loadBreeds();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao importar raças globais.');
    } finally {
      setImportingWorld(false);
    }
  };

  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
  const filteredBreeds = breeds.filter((breed) => {
    if (!normalizedSearch) return true;
    const name = String(breed.name || '').toLowerCase();
    const origin = String(breed.origin || '').toLowerCase();
    return name.includes(normalizedSearch) || origin.includes(normalizedSearch);
  });

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <h1>Raças</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {isAdmin && (
        <button onClick={handleImportWorldBreeds} disabled={importingWorld} style={{ marginRight: '10px' }}>
          {importingWorld ? 'Importando...' : '🌍 Importar Raças do Mundo'}
        </button>
      )}
      
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancelar' : '+ Adicionar Raça'}
      </button>

      <div style={{ marginTop: '20px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar raça (ex: american bull)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '380px' }}
        />
        <p style={{ marginTop: '8px' }}>
          A mostrar {filteredBreeds.length} de {breeds.length} raças
        </p>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Nova Raça</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Origem</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Características</label>
              <textarea
                name="characteristics"
                value={formData.characteristics}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Peso Mínimo (kg)</label>
              <input
                type="number"
                name="min_weight"
                step="0.1"
                value={formData.min_weight}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Peso Máximo (kg)</label>
              <input
                type="number"
                name="max_weight"
                step="0.1"
                value={formData.max_weight}
                onChange={handleChange}
              />
            </div>
            <button type="submit">Adicionar Raça</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        {filteredBreeds.map(breed => (
          <div className="card" key={breed.id}>
            <h3>{breed.name}</h3>
            <p><strong>Origem:</strong> {breed.origin || '-'}</p>
            {breed.description && <p><strong>Descrição:</strong> {breed.description}</p>}
            {breed.characteristics && <p><strong>Características:</strong> {breed.characteristics}</p>}
            {breed.min_weight && (
              <p><strong>Peso:</strong> {breed.min_weight} - {breed.max_weight} kg</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BreedsPage;
