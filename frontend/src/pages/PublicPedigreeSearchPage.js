import React, { useState } from 'react';
import api from '../api';
import './PublicPedigreeSearchPage.css';

function PublicPedigreeSearchPage() {
  const [searchType, setSearchType] = useState('dog_name');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const apiOrigin = (api?.defaults?.baseURL || '').replace(/\/api\/?$/, '');

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    return `${apiOrigin}${photoPath}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Por favor, preencha o campo de busca');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);
    setResults([]);
    setSelectedDog(null);

    try {
      const params = new URLSearchParams();
      
      if (searchType === 'dog_name') {
        params.append('dog_name', searchValue);
      } else if (searchType === 'dog_id') {
        params.append('dog_id', searchValue);
      } else if (searchType === 'breeder_name') {
        params.append('breeder_name', searchValue);
      }

      const response = await api.get(`/pedigree/public/search?${params.toString()}`);
      
      if (response.data.results.length === 0) {
        setMessage('Nenhum cão encontrado com esses critérios. Tente outro termo de busca.');
      } else {
        setResults(response.data.results);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar pedigree');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (dogId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/pedigree/public/detail/${dogId}`);
      setSelectedDog(response.data);
    } catch (err) {
      setError('Erro ao carregar detalhes do pedigree');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PedigreeCell = ({ name, registrationId, label, photoUrl, isMain = false }) => (
    <div className={`public-pedigree-box ${isMain ? 'main' : ''}`}>
      {photoUrl && (
        <img
          src={getPhotoUrl(photoUrl)}
          alt={name || 'Cão'}
          className={`public-pedigree-photo ${isMain ? 'main-photo' : ''}`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <strong>{name || '—'}</strong>
      <small>{registrationId || '—'}</small>
      {label ? <small>{label}</small> : null}
    </div>
  );

  const renderPedigreeTree = (dog) => {
    return (
      <div className="public-pedigree-layout">
        <div className="public-pedigree-title-row">
          <h3>Pedigree de {dog.name}</h3>
          <button type="button" className="public-pedigree-print-btn" onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
        </div>

        <div className="public-pedigree-meta-card">
          <h4>Tabela de 4 gerações</h4>
          <div className="public-pedigree-hero">
            {dog.photo_url && (
              <img
                src={getPhotoUrl(dog.photo_url)}
                alt={`Foto de ${dog.name}`}
                className="public-pedigree-hero-photo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="public-pedigree-meta-grid">
              <p><strong>Nome:</strong> {dog.name || 'N/A'}</p>
              <p><strong>Registo:</strong> {dog.registration_id || 'N/A'}</p>
              <p><strong>Raça:</strong> {dog.breed_name || 'N/A'}</p>
              <p><strong>Género:</strong> {dog.gender === 'M' ? 'Macho' : dog.gender === 'F' ? 'Fêmea' : 'N/A'}</p>
              <p><strong>Nascimento:</strong> {dog.birth_date ? new Date(dog.birth_date).toLocaleDateString('pt-PT') : 'N/A'}</p>
              <p><strong>Criador:</strong> {dog.breeder_name || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="public-pedigree-table-wrap">
          <table className="public-pedigree-table">
            <thead>
              <tr>
                <th>First</th>
                <th>Second</th>
                <th>Third</th>
                <th>Fourth</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="8" className="public-current-dog-cell">
                  <PedigreeCell
                    name={dog.name}
                    registrationId={dog.registration_id}
                    photoUrl={dog.photo_url}
                    isMain={true}
                  />
                </td>
                <td rowSpan="4">
                  <PedigreeCell
                    name={dog.father_name ? `(Sire) ${dog.father_name}` : '—'}
                    registrationId={dog.father_registration_id}
                    photoUrl={dog.father_photo_url}
                  />
                </td>
                <td>
                  <PedigreeCell
                    name={dog.paternal_grandfather_name}
                    registrationId={dog.paternal_grandfather_registration_id}
                    photoUrl={dog.paternal_grandfather_photo_url}
                  />
                </td>
                <td><PedigreeCell label="Bis-Avô Pat. Pat." /></td>
              </tr>
              <tr>
                <td>
                  <PedigreeCell
                    name={dog.paternal_grandmother_name}
                    registrationId={dog.paternal_grandmother_registration_id}
                    photoUrl={dog.paternal_grandmother_photo_url}
                  />
                </td>
                <td><PedigreeCell label="Bis-Avó Pat. Pat." /></td>
              </tr>
              <tr>
                <td><PedigreeCell label="—" /></td>
                <td><PedigreeCell label="Bis-Avô Pat. Mat." /></td>
              </tr>
              <tr>
                <td><PedigreeCell label="—" /></td>
                <td><PedigreeCell label="Bis-Avó Pat. Mat." /></td>
              </tr>
              <tr>
                <td rowSpan="4">
                  <PedigreeCell
                    name={dog.mother_name ? `(Dam) ${dog.mother_name}` : '—'}
                    registrationId={dog.mother_registration_id}
                    photoUrl={dog.mother_photo_url}
                  />
                </td>
                <td>
                  <PedigreeCell
                    name={dog.maternal_grandfather_name}
                    registrationId={dog.maternal_grandfather_registration_id}
                    photoUrl={dog.maternal_grandfather_photo_url}
                  />
                </td>
                <td><PedigreeCell label="Bis-Avô Mat. Pat." /></td>
              </tr>
              <tr>
                <td>
                  <PedigreeCell
                    name={dog.maternal_grandmother_name}
                    registrationId={dog.maternal_grandmother_registration_id}
                    photoUrl={dog.maternal_grandmother_photo_url}
                  />
                </td>
                <td><PedigreeCell label="Bis-Avó Mat. Pat." /></td>
              </tr>
              <tr>
                <td><PedigreeCell label="—" /></td>
                <td><PedigreeCell label="Bis-Avô Mat. Mat." /></td>
              </tr>
              <tr>
                <td><PedigreeCell label="—" /></td>
                <td><PedigreeCell label="Bis-Avó Mat. Mat." /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="public-pedigree-container">
      <div className="header-section">
        <h1>🐕 Buscar Pedigree Público</h1>
        <p>Procure informações sobre qualquer cão no nosso registo - sem necessidade de conta</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-type-tabs">
            <button
              type="button"
              className={`tab-btn ${searchType === 'dog_name' ? 'active' : ''}`}
              onClick={() => setSearchType('dog_name')}
            >
              🔍 Por Nome do Cão
            </button>
            <button
              type="button"
              className={`tab-btn ${searchType === 'dog_id' ? 'active' : ''}`}
              onClick={() => setSearchType('dog_id')}
            >
              🏷️ Por ID/Registo
            </button>
            <button
              type="button"
              className={`tab-btn ${searchType === 'breeder_name' ? 'active' : ''}`}
              onClick={() => setSearchType('breeder_name')}
            >
              👤 Por Criador
            </button>
          </div>

          <div className="search-input-group">
            {searchType === 'dog_name' && (
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ex: Rex, Bella, Afrodite..."
                className="search-input"
              />
            )}
            {searchType === 'dog_id' && (
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ex: REG-260311-0001"
                className="search-input"
              />
            )}
            {searchType === 'breeder_name' && (
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ex: João Silva, Maria Santos..."
                className="search-input"
              />
            )}
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-info">{message}</div>}

      {selectedDog ? (
        <div className="results-section">
          <button className="back-btn" onClick={() => setSelectedDog(null)}>
            ← Voltar aos resultados
          </button>
          {renderPedigreeTree(selectedDog)}
        </div>
      ) : results.length > 0 ? (
        <div className="results-section">
          <h2>Resultados da Busca ({results.length})</h2>
          <div className="results-grid">
            {results.map(dog => (
              <div key={dog.id} className="result-card">
                {dog.photo_url && (
                  <img
                    src={getPhotoUrl(dog.photo_url)}
                    alt={`Foto de ${dog.name}`}
                    className="public-result-photo"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <h3>{dog.name}</h3>
                <div className="result-info">
                  <p><strong>Raça:</strong> {dog.breed_name || 'N/A'}</p>
                  <p><strong>Registo:</strong> {dog.registration_id || 'N/A'}</p>
                  <p><strong>Género:</strong> {dog.gender === 'M' ? '♂ Macho' : '♀ Fêmea'}</p>
                  <p><strong>Criador:</strong> {dog.breeder_name || 'N/A'}</p>
                  {dog.birth_date && (
                    <p><strong>Nasc:</strong> {new Date(dog.birth_date).toLocaleDateString('pt-PT')}</p>
                  )}
                </div>
                <button 
                  className="view-btn"
                  onClick={() => handleViewDetail(dog.id)}
                  disabled={loading}
                >
                  👁️ Ir Buscar Pedigree Completo
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="info-section">
        <h3>ℹ️ Como funciona</h3>
        <ul>
          <li>✓ Searchable por <strong>nome do cão</strong>, <strong>registo</strong> ou <strong>criador</strong></li>
          <li>✓ Veja o <strong>pedigree completo</strong> com 3 gerações</li>
          <li>✓ <strong>Sem necessidade de conta</strong> - acesso público e livre</li>
          <li>✓ Informações sempre <strong>atualizadas</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default PublicPedigreeSearchPage;
