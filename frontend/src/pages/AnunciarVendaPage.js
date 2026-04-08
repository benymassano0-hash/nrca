import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import './AnunciarVendaPage.css';

function AnunciarVendaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [listed, setListed] = useState([]);
  const [available, setAvailable] = useState([]);
  const [form, setForm] = useState({
    dog_id: '',
    sale_price: '',
    sale_description: '',
    sale_contact: '',
    sale_city: '',
  });

  const selectedDog = useMemo(
    () => available.find((dog) => String(dog.id) === String(form.dog_id)),
    [available, form.dog_id]
  );

  const loadListings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/dogs/sale/my/listings');
      setListed(response.data?.listed || []);
      setAvailable(response.data?.available || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar anúncios de venda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.dog_id || !form.sale_price) {
      setError('Selecione um cão e indique o preço.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/dogs/${form.dog_id}/sale`, {
        sale_price: form.sale_price,
        sale_description: form.sale_description,
        sale_contact: form.sale_contact,
        sale_city: form.sale_city,
      });
      setSuccess('Cão anunciado para venda com sucesso.');
      setForm({ dog_id: '', sale_price: '', sale_description: '', sale_contact: '', sale_city: '' });
      await loadListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao anunciar cão para venda');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (dogId) => {
    const confirmed = window.confirm('Remover este anúncio de venda?');
    if (!confirmed) return;

    try {
      await api.delete(`/dogs/${dogId}/sale`);
      setSuccess('Anúncio removido com sucesso.');
      setError('');
      await loadListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao remover anúncio');
    }
  };

  if (loading) return <div className="loading">Carregando anúncios...</div>;

  return (
    <div className="anunciar-venda-container">
      <div className="card venda-header-card">
        <h1>💸 Anunciar Cães à Venda</h1>
        <p>Publique cães já registados para venda pública na plataforma.</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card venda-form-card">
        <h2>Novo Anúncio</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cão*</label>
            <select name="dog_id" value={form.dog_id} onChange={handleChange} required>
              <option value="">Selecione um cão</option>
              {available.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.registration_id} - {dog.name} ({dog.breed_name || 'Sem raça'})
                </option>
              ))}
            </select>
          </div>

          {selectedDog && (
            <div className="selected-dog-box">
              <strong>{selectedDog.name}</strong>
              <span>{selectedDog.registration_id}</span>
            </div>
          )}

          <div className="form-group">
            <label>Preço (Kz)*</label>
            <input
              type="number"
              min="1"
              step="0.01"
              name="sale_price"
              value={form.sale_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contacto</label>
            <input
              type="text"
              name="sale_contact"
              value={form.sale_contact}
              onChange={handleChange}
              placeholder="Telefone / WhatsApp"
            />
          </div>

          <div className="form-group">
            <label>Cidade</label>
            <input
              type="text"
              name="sale_city"
              value={form.sale_city}
              onChange={handleChange}
              placeholder="Ex: Luanda"
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              rows="4"
              name="sale_description"
              value={form.sale_description}
              onChange={handleChange}
              placeholder="Informações do cão, pedigree, vacinação, etc."
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'A publicar...' : 'Publicar Anúncio'}
          </button>
        </form>
      </div>

      <div className="card venda-list-card">
        <h2>Meus Cães Anunciados ({listed.length})</h2>
        {listed.length === 0 ? (
          <p>Ainda não tem cães anunciados para venda.</p>
        ) : (
          <div className="venda-grid">
            {listed.map((dog) => (
              <article key={dog.id} className="venda-item">
                <h3>{dog.name}</h3>
                <p><strong>Registo:</strong> {dog.registration_id}</p>
                <p><strong>Raça:</strong> {dog.breed_name || '-'}</p>
                <p><strong>Preço:</strong> {Number(dog.sale_price || 0).toLocaleString('pt-PT')} Kz</p>
                {dog.sale_city && <p><strong>Cidade:</strong> {dog.sale_city}</p>}
                {dog.sale_contact && <p><strong>Contacto:</strong> {dog.sale_contact}</p>}
                {dog.sale_description && <p className="desc">{dog.sale_description}</p>}
                <button type="button" className="remove-btn" onClick={() => handleRemove(dog.id)}>
                  Remover anúncio
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnunciarVendaPage;
