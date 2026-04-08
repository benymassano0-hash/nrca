import React, { useState, useEffect } from 'react';
import api from '../api';

function BreedingsPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOperationPanel = currentUser?.user_type === 'admin' || currentUser?.user_type === 'registration_agent';
  const isBreeder = currentUser?.user_type === 'breeder';
  const [breedings, setBreedings] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
    const [breederTickets, setBreederTickets] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    father_id: '',
    mother_id: '',
    breeding_date: '',
    expected_puppies_count: '',
  });

  useEffect(() => {
    loadBreedings();
    loadDogs();
    if (isBreeder) { loadBreederTickets(); }
  }, []);

  const loadBreederTickets = async () => {
    try {
      const res = await api.get('/users/profile');
      setBreederTickets(Number(res.data?.tickets || 0));
    } catch (_) {}
  };

  const loadBreedings = async () => {
    try {
      let endpoint = '/breedings';

      if (!isOperationPanel) {
        let breederId = currentUser?.id;
        if (!breederId) {
          const profileResponse = await api.get('/users/profile');
          breederId = profileResponse.data?.id;
        }
        endpoint = `/breedings?breeder_id=${breederId}`;
      }

      const response = await api.get(endpoint);
      setBreedings(response.data);
    } catch (err) {
      setError('Erro ao carregar cruzamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadDogs = async () => {
    if (!isOperationPanel && !isBreeder) { return; }
    try {
      let endpoint = '/dogs';
      if (isBreeder) {
        let breederId = currentUser?.id;
        if (!breederId) {
          const profileResponse = await api.get('/users/profile');
          breederId = profileResponse.data?.id;
        }
        endpoint = `/dogs?breeder_id=${breederId}`;
      }
      const response = await api.get(endpoint);
      setDogs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/breedings', formData);
      setSuccess('Cruzamento registado com sucesso.');
      setShowForm(false);
      setFormData({ father_id: '', mother_id: '', breeding_date: '', expected_puppies_count: '' });
      loadBreedings();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar cruzamento');
    }
  };

  const handleConfirmBreeding = async (breedingId, confirmed) => {
    setError('');
    setSuccess('');
    setConfirmingId(breedingId);
    try {
      const response = await api.put(`/breedings/${breedingId}/confirm`, {
        confirmed,
      });
      setSuccess(response?.data?.message || 'Confirmação atualizada.');
      await loadBreedings();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao confirmar cruzamento');
    } finally {
      setConfirmingId(null);
    }
  };

  const maleDogsForBreeding = dogs.filter(d => d.gender === 'M');
  const femaleDogsForBreeding = dogs.filter(d => d.gender === 'F');

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <h1>Cruzamentos</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {(isOperationPanel || isBreeder) && (
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Novo Cruzamento'}
        </button>
      )}

      {(isOperationPanel || isBreeder) && showForm && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Novo Cruzamento</h3>
          {isBreeder ? (
            <>
              <p style={{ marginTop: 0, color: '#6d28d9' }}>
                🎟️ Esta operação consome <strong>1 ticket</strong>. Tickets disponíveis: <strong>{breederTickets}</strong>
              </p>
              {breederTickets < 1 && (
                <p style={{ marginTop: 0, color: '#dc2626', fontWeight: 600 }}>
                  ⚠️ Sem tickets suficientes. Contacte o administrador para carregar tickets.
                </p>
              )}
            </>
          ) : (
            <p style={{ marginTop: 0, color: '#6d28d9' }}>
              🎟️ Esta operação consome 1 ticket do criador envolvido.
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Pai (Macho)*</label>
              <select
                name="father_id"
                value={formData.father_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o pai</option>
                {maleDogsForBreeding.map(dog => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.registration_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Mãe (Fêmea)*</label>
              <select
                name="mother_id"
                value={formData.mother_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione a mãe</option>
                {femaleDogsForBreeding.map(dog => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.registration_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Data do Cruzamento*</label>
              <input
                type="date"
                name="breeding_date"
                value={formData.breeding_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Número Esperado de Filhotes</label>
              <input
                type="number"
                name="expected_puppies_count"
                value={formData.expected_puppies_count}
                onChange={handleChange}
              />
            </div>
            <button type="submit">Registar Cruzamento</button>
          </form>
        </div>
      )}

      {isBreeder && breedings.length === 0 && (
        <div className="card" style={{ marginTop: '20px', borderLeft: '6px solid #2563eb' }}>
          <p style={{ margin: 0 }}>
            Ainda não existem cruzamentos associados ao seu canil para confirmar.
          </p>
        </div>
      )}

      <table style={{ marginTop: '30px' }}>
        <thead>
          <tr>
            <th>Criador Envolvido</th>
            <th>Pai</th>
            <th>Mãe</th>
            <th>Data</th>
            <th>Filhotes Esperados</th>
            <th>Filhotes Reais</th>
            <th>Status</th>
            <th>Confirmação do Criador</th>
          </tr>
        </thead>
        <tbody>
          {breedings.map(breeding => (
            <tr key={breeding.id}>
              <td>{breeding.breeder_name || breeding.breeder_username || '-'}</td>
              <td>{breeding.father_name} ({breeding.father_registration_id})</td>
              <td>{breeding.mother_name} ({breeding.mother_registration_id})</td>
              <td>{breeding.breeding_date}</td>
              <td>{breeding.expected_puppies_count || '-'}</td>
              <td>{breeding.actual_puppies_count || '-'}</td>
              <td>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  backgroundColor: breeding.status === 'completed' ? '#d4edda' : 
                                   breeding.status === 'cancelled' ? '#f8d7da' : '#cfe2ff',
                  fontSize: '12px'
                }}>
                  {breeding.status}
                </span>
              </td>
              <td>
                {isBreeder ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleConfirmBreeding(breeding.id, true)}
                      disabled={confirmingId === breeding.id}
                      style={{ background: '#16a34a' }}
                    >
                      {confirmingId === breeding.id ? 'A confirmar...' : '✅ Fiz'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmBreeding(breeding.id, false)}
                      disabled={confirmingId === breeding.id}
                      style={{ background: '#dc2626' }}
                    >
                      {confirmingId === breeding.id ? 'A confirmar...' : '❌ Não fiz'}
                    </button>
                  </div>
                ) : (
                  <span>
                    {breeding.breeder_confirmed === 1 || breeding.breeder_confirmed === true
                      ? '✅ Confirmado pelo criador'
                      : breeding.breeder_confirmed === 0 || breeding.breeder_confirmed === false
                        ? '❌ Negado pelo criador'
                        : '⏳ Aguardando confirmação'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card" style={{ marginTop: '20px', borderLeft: '6px solid #f59e0b' }}>
        <p style={{ margin: 0 }}>
          🎟️ Cada registo de ninhada consome <strong>1 ticket</strong> da conta do criador envolvido.
        </p>
        <p style={{ margin: '8px 0 0' }}>
          Para adquirir tickets, contacte o administrador por WhatsApp: <strong>+351 935013630</strong>.
        </p>
      </div>
    </div>
  );
}

export default BreedingsPage;
