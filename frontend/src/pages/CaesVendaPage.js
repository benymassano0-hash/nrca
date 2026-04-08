import React, { useEffect, useState } from 'react';
import api from '../api';
import './CaesVendaPage.css';

function CaesVendaPage() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiOrigin = (api?.defaults?.baseURL || '').replace(/\/api\/?$/, '');

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    return `${apiOrigin}${photoPath}`;
  };

  useEffect(() => {
    const loadDogsForSale = async () => {
      try {
        const response = await api.get('/dogs/sale/public');
        setDogs(response.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao carregar cães à venda');
      } finally {
        setLoading(false);
      }
    };

    loadDogsForSale();
  }, []);

  if (loading) return <div className="loading">Carregando cães à venda...</div>;

  return (
    <div className="caes-venda-container">
      <div className="card venda-public-header">
        <h1>🐶 Cães à Venda</h1>
        <p>Anúncios públicos de cães registados na plataforma.</p>
      </div>

      {error && <div className="error">{error}</div>}

      {dogs.length === 0 ? (
        <div className="card">
          <p>De momento não existem cães anunciados para venda.</p>
        </div>
      ) : (
        <div className="venda-public-grid">
          {dogs.map((dog) => (
            <article key={dog.id} className="venda-public-item card">
              {dog.photo_url && (
                <img
                  src={getPhotoUrl(dog.photo_url)}
                  alt={`Foto de ${dog.name}`}
                  className="venda-public-photo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h3>{dog.name}</h3>
              <p><strong>Registo:</strong> {dog.registration_id}</p>
              <p><strong>Raça:</strong> {dog.breed_name || '-'}</p>
              <p><strong>Sexo:</strong> {dog.gender === 'M' ? 'Macho' : dog.gender === 'F' ? 'Fêmea' : '-'}</p>
              <p><strong>Preço:</strong> {Number(dog.sale_price || 0).toLocaleString('pt-PT')} Kz</p>
              {(dog.breeder_name || dog.kennel_name) && (
                <p><strong>Criador/Canil:</strong> {dog.kennel_name || dog.breeder_name}</p>
              )}
              {dog.sale_city && <p><strong>Cidade:</strong> {dog.sale_city}</p>}
              {dog.sale_contact && <p><strong>Contacto:</strong> {dog.sale_contact}</p>}
              {dog.sale_description && <p className="venda-public-desc">{dog.sale_description}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CaesVendaPage;
