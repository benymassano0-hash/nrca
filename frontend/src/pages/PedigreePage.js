import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './PedigreePage.css';

function PedigreePage() {
  const { registration_id } = useParams();
  const [pedigree, setPedigree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');
  const [savingPedigree, setSavingPedigree] = useState(false);
  const [pedigreeForm, setPedigreeForm] = useState({
    dog_id: '',
    father_id: '',
    mother_id: '',
    notes: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = currentUser?.user_type === 'admin';

  const apiOrigin = (api?.defaults?.baseURL || '').replace(/\/api\/?$/, '');
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    return `${apiOrigin}${photoPath}`;
  };

  const DogCard = ({ name, registrationId, photoUrl, label, isMain = false }) => (
    <div className={`dog-box ${isMain ? 'main' : ''}`}>
      {photoUrl && (
        <img
          src={getPhotoUrl(photoUrl)}
          alt={name || 'Cão'}
          className="pedigree-dog-photo"
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

  useEffect(() => {
    loadPedigree();
  }, [registration_id]);

  const loadPedigree = async () => {
    try {
      const response = await api.get(`/pedigree/registration/${registration_id}`);
      setPedigree(response.data);
      setPedigreeForm(prev => ({
        ...prev,
        dog_id: response.data.id || prev.dog_id,
        father_id: response.data.father_id || '',
        mother_id: response.data.mother_id || ''
      }));
    } catch (err) {
      setError('Pedigree não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPedigreeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterPedigree = async (e) => {
    e.preventDefault();
    setAdminMessage('');
    setAdminError('');
    setSavingPedigree(true);

    try {
      await api.post('/pedigree/register', pedigreeForm);
      setAdminMessage('Pedigree registado com sucesso.');
      await loadPedigree();
    } catch (err) {
      setAdminError(err.response?.data?.error || 'Erro ao registar pedigree.');
    } finally {
      setSavingPedigree(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) {
    return (
      <div>
        <div className="error">{error}</div>
        {isAdmin && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Registar Pedigree (Admin)</h3>
            {adminMessage && <div className="success">{adminMessage}</div>}
            {adminError && <div className="error">{adminError}</div>}
            <form onSubmit={handleRegisterPedigree}>
              <div className="form-group">
                <label>ID do Cão*</label>
                <input name="dog_id" value={pedigreeForm.dog_id} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>ID do Pai*</label>
                <input name="father_id" value={pedigreeForm.father_id} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>ID da Mãe*</label>
                <input name="mother_id" value={pedigreeForm.mother_id} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea name="notes" value={pedigreeForm.notes} onChange={handleFormChange} />
              </div>
              <button type="submit" disabled={savingPedigree}>
                {savingPedigree ? 'A gravar...' : 'Registar Pedigree'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }
  if (!pedigree) return <div className="error">Pedigree não encontrado</div>;

  return (
    <div className="pedigree-print-layout">
      <div className="pedigree-title-row">
        <h1>Pedigree de {pedigree.name}</h1>
        <button type="button" className="pedigree-print-btn" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>

      <div className="card pedigree-meta-card" style={{ marginBottom: '20px' }}>
        <h2>Tabela de 4 gerações</h2>
        <div className="pedigree-meta-grid">
          <p><strong>Nome:</strong> {pedigree.name || '-'}</p>
          <p><strong>Registo #:</strong> {pedigree.registration_id || '-'}</p>
          <p><strong>Raça:</strong> {pedigree.breed_name || '-'}</p>
          <p><strong>Sexo:</strong> {pedigree.gender === 'M' ? 'Macho' : pedigree.gender === 'F' ? 'Fêmea' : '-'}</p>
          <p><strong>Nascimento:</strong> {pedigree.birth_date || '-'}</p>
          <p><strong>Cor:</strong> {pedigree.color || '-'}</p>
          <p><strong>Microchip:</strong> {pedigree.microchip_id || '-'}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="card pedigree-admin-panel" style={{ marginBottom: '20px' }}>
          <h3>Registar / Atualizar Pedigree (Admin)</h3>
          {adminMessage && <div className="success">{adminMessage}</div>}
          {adminError && <div className="error">{adminError}</div>}
          <form onSubmit={handleRegisterPedigree}>
            <div className="form-group">
              <label>ID do Cão*</label>
              <input name="dog_id" value={pedigreeForm.dog_id} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>ID do Pai*</label>
              <input name="father_id" value={pedigreeForm.father_id} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>ID da Mãe*</label>
              <input name="mother_id" value={pedigreeForm.mother_id} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea name="notes" value={pedigreeForm.notes} onChange={handleFormChange} />
            </div>
            <button type="submit" disabled={savingPedigree}>
              {savingPedigree ? 'A gravar...' : 'Registar Pedigree'}
            </button>
          </form>
        </div>
      )}

      <div className="card pedigree-tree-card">
        <h2>Tabela de 4 gerações</h2>
        
        {/* Cabeçalho com informações do cão */}
        <div className="pedigree-header">
          <div className="pedigree-main-info">
            <h1 className="pedigree-dog-name">{pedigree.name}</h1>
            <div className="pedigree-dog-details">
              <div><strong>Nº Registo:</strong> {pedigree.registration_id}</div>
              <div><strong>Raça:</strong> {pedigree.breed_name || '-'}</div>
              <div><strong>Sexo:</strong> {pedigree.gender === 'M' ? '♂ Macho' : '♀ Fêmea'}</div>
              <div><strong>Data Nascimento:</strong> {pedigree.birth_date ? new Date(pedigree.birth_date).toLocaleDateString('pt-pt') : '-'}</div>
              <div><strong>Cor:</strong> {pedigree.color || '-'}</div>
              {pedigree.microchip_id && <div><strong>Microchip:</strong> {pedigree.microchip_id}</div>}
            </div>
          </div>
        </div>

        {/* Árvore Genealógica em Colunas */}
        <div className="pedigree-tree-container">
          <table className="pedigree-tree">
            <thead>
              <tr>
                <th className="gen-col">First</th>
                <th className="gen-col">Second</th>
                <th className="gen-col">Third</th>
                <th className="gen-col">Fourth</th>
              </tr>
            </thead>
            <tbody>
              {/* Linha 1: Sire (Pai) */}
              <tr className="pedigree-row">
                <td rowSpan="8" className="current-dog-cell">
                  <DogCard
                    name={pedigree.name}
                    registrationId={pedigree.registration_id}
                    photoUrl={pedigree.photo_url}
                    isMain={true}
                  />
                </td>
                <td rowSpan="4" className="gen-cell sire-cell">
                  <DogCard
                    name={pedigree.father_name ? `(Sire) ${pedigree.father_name}` : '—'}
                    registrationId={pedigree.father_registration_id}
                    photoUrl={pedigree.father_photo_url}
                  />
                </td>
                <td className="gen-cell">
                  <DogCard
                    name={pedigree.paternal_grandfather_name}
                    registrationId={pedigree.paternal_grandfather_registration_id}
                    photoUrl={pedigree.paternal_grandfather_photo_url}
                  />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avô Pat. Pat." />
                </td>
              </tr>
              {/* Linha 2 */}
              <tr className="pedigree-row">
                <td className="gen-cell">
                  <DogCard
                    name={pedigree.paternal_grandmother_name}
                    registrationId={pedigree.paternal_grandmother_registration_id}
                    photoUrl={pedigree.paternal_grandmother_photo_url}
                  />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avó Pat. Pat." />
                </td>
              </tr>
              {/* Linha 3 */}
              <tr className="pedigree-row">
                <td className="gen-cell">
                  <DogCard label="—" />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avô Pat. Mat." />
                </td>
              </tr>
              {/* Linha 4 */}
              <tr className="pedigree-row">
                <td className="gen-cell">
                  <DogCard label="—" />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avó Pat. Mat." />
                </td>
              </tr>
              {/* Linha 5: Dam (Mãe) */}
              <tr className="pedigree-row">
                <td rowSpan="4" className="gen-cell dam-cell">
                  <DogCard
                    name={pedigree.mother_name ? `(Dam) ${pedigree.mother_name}` : '—'}
                    registrationId={pedigree.mother_registration_id}
                    photoUrl={pedigree.mother_photo_url}
                  />
                </td>
                <td className="gen-cell">
                  <DogCard
                    name={pedigree.maternal_grandfather_name}
                    registrationId={pedigree.maternal_grandfather_registration_id}
                    photoUrl={pedigree.maternal_grandfather_photo_url}
                  />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avô Mat. Pat." />
                </td>
              </tr>
              {/* Linha 6 */}
              <tr className="pedigree-row">
                <td className="gen-cell">
                  <DogCard
                    name={pedigree.maternal_grandmother_name}
                    registrationId={pedigree.maternal_grandmother_registration_id}
                    photoUrl={pedigree.maternal_grandmother_photo_url}
                  />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avó Mat. Pat." />
                </td>
              </tr>
              {/* Linha 7 */}
              <tr className="pedigree-row">
                <td className="gen-cell">
                  <DogCard label="—" />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avô Mat. Mat." />
                </td>
              </tr>
              {/* Linha 8 */}
              <tr className="pedigree-row">
                <td className="gen-cell">
                  <DogCard label="—" />
                </td>
                <td className="gen-cell">
                  <DogCard label="Bis-Avó Mat. Mat." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="pedigree-signature">
        Criador do app: José João Massano
      </div>
    </div>
  );
}

export default PedigreePage;
