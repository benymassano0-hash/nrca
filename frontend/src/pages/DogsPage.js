import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function DogsPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOperationPanel = currentUser?.user_type === 'admin' || currentUser?.user_type === 'registration_agent';
  const isBreeder = currentUser?.user_type === 'breeder';
  const canDeleteDogs = currentUser?.user_type === 'admin';
  const [breederProfile, setBreederProfile] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nextRegistrationId, setNextRegistrationId] = useState('A gerar...');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [breederCanRegister, setBreederCanRegister] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    breeder_name: '',
    breed_id: '',
    birth_date: '',
    gender: 'M',
    color: '',
    microchip_id: '',
    father_id: '',
    mother_id: '',
  });

  useEffect(() => {
    loadDogs();
    loadBreeds();
    loadNextRegistrationId();
    loadBreederPermission();
    loadMyProfile();
  }, []);

  const loadDogs = async () => {
    try {
      let endpoint = '/dogs';

      if (!isOperationPanel) {
        let breederId = breederProfile?.id || currentUser?.id;
        if (!breederId) {
          const profileResponse = await api.get('/users/profile');
          breederId = profileResponse.data?.id;
          if (profileResponse.data) {
            setBreederProfile(profileResponse.data);
          }
        }
        endpoint = breederId ? `/dogs?breeder_id=${breederId}` : '/dogs';
      }

      const response = await api.get(endpoint);
      setDogs(response.data);
    } catch (err) {
      setError('Erro ao carregar cães');
    } finally {
      setLoading(false);
    }
  };

  const loadBreeds = async () => {
    try {
      const response = await api.get('/breeds');
      setBreeds(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNextRegistrationId = async () => {
    if (!isOperationPanel && !isBreeder) {
      return;
    }

    try {
      const response = await api.get('/dogs/next-registration-id');
      setNextRegistrationId(response.data.registration_id || 'N/A');
    } catch (err) {
      setNextRegistrationId('N/A');
    }
  };

  const loadMyProfile = async () => {
    if (!isBreeder) {
      return;
    }

    try {
      const response = await api.get('/users/profile');
      const profile = response.data || null;
      setBreederProfile(profile);
      setFormData((prev) => ({
        ...prev,
        breeder_name: profile?.username || profile?.full_name || currentUser?.username || '',
      }));
    } catch (err) {
      console.error('Erro ao carregar perfil do criador:', err);
      setBreederProfile(currentUser || null);
      setFormData((prev) => ({
        ...prev,
        breeder_name: currentUser?.username || currentUser?.full_name || '',
      }));
    }
  };

  const loadBreederPermission = async () => {
    try {
      const response = await api.get('/settings/breeders_can_register_dogs');
      setBreederCanRegister(response.data.value === true || response.data.value === 'true');
    } catch (err) {
      console.error('Erro ao carregar permissão de criadores:', err);
      setBreederCanRegister(true); // default true
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      return;
    }

    setSelectedPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (submitting) {
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('breeder_name', formData.breeder_name || currentUser?.username || '');
      payload.append('breed_id', formData.breed_id);
      payload.append('birth_date', formData.birth_date);
      payload.append('gender', formData.gender);
      payload.append('color', formData.color);
      payload.append('microchip_id', formData.microchip_id);
      if (formData.father_id) {
        payload.append('father_id', formData.father_id);
      }
      if (formData.mother_id) {
        payload.append('mother_id', formData.mother_id);
      }

      if (formData.father_id && formData.mother_id && formData.father_id === formData.mother_id) {
        setError('Pai e Mãe devem ser cães diferentes.');
        return;
      }

      if (selectedPhoto) {
        payload.append('photo', selectedPhoto);
      }

      const response = await api.post('/dogs', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowForm(false);
      setFormData({
        name: '',
        breeder_name: '',
        breed_id: '',
        birth_date: '',
        gender: 'M',
        color: '',
        microchip_id: '',
        father_id: '',
        mother_id: '',
      });
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      setSuccess(`Cão registado com sucesso. ID gerado: ${response.data.registration_id}. Foi consumido 1 ticket.`);
      await loadMyProfile();
      loadDogs();
      loadNextRegistrationId();
    } catch (err) {
      const apiMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : '');
      setError(apiMessage || 'Erro ao adicionar cão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDog = async (dog) => {
    const confirmDelete = window.confirm(
      `Eliminar o cão ${dog.name} (${dog.registration_id})?\n\nEsta ação é irreversível.`
    );
    if (!confirmDelete) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/dogs/${dog.id}`);
      setDogs((prev) => prev.filter((d) => d.id !== dog.id));
      setSuccess(`Cão ${dog.registration_id} eliminado com sucesso.`);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : '');
      setError(apiMessage || 'Não foi possível eliminar o cão.');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  const breederIsActive = breederProfile ? Number(breederProfile.is_active) !== 0 : Number(currentUser?.is_active ?? 1) !== 0;
  const breederTicketsAvailable = Number(breederProfile?.tickets || 0);
  const breederHasTickets = breederTicketsAvailable > 0;
  const canBreederRegister = isBreeder && breederCanRegister && breederIsActive && breederHasTickets;
  const canOpenForm = isOperationPanel || canBreederRegister;

  return (
    <div>
      <h1>Cães Registados</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {isBreeder && (!breederCanRegister || !breederIsActive || !breederHasTickets) && (
        <div className="blocked-message">
          <h3>🔒 Registo de Cães Bloqueado</h3>
          <p>
            {!breederCanRegister
              ? 'Neste momento, o sistema está a bloquear novos registos de cães por parte dos criadores.'
              : !breederIsActive
              ? 'A sua conta de criador está desligada para registo de cães. Contacte o administrador para ativação após pagamento.'
              : 'Sem tickets disponíveis na conta. Peça ao admin para carregar tickets.'}
          </p>
          <p>
            Tickets atuais: <strong>{breederTicketsAvailable}</strong>
          </p>
          <p>Por favor, contacte o administrador para mais informações. WhatsApp: <strong>+351 935013630</strong></p>
        </div>
      )}

      {isBreeder && breederHasTickets && (
        <div className="card" style={{ marginTop: '16px' }}>
          <p style={{ margin: 0, color: '#14532d' }}>
            🎟️ Tickets disponíveis para registar cães: <strong>{breederTicketsAvailable}</strong>
          </p>
        </div>
      )}
      
      {canOpenForm && (
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Adicionar Cão'}
        </button>
      )}

      {canOpenForm && showForm && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Novo Cão</h3>
          <p style={{ marginTop: 0, color: '#475569' }}>
            ID de registo gerado automaticamente: <strong>{nextRegistrationId}</strong>
          </p>
          <p style={{ marginTop: 0, color: '#92400e' }}>
            Para mais informação do registo, deixa uma SMS no WhatsApp: <strong>+351 935013630</strong>
          </p>
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
              <label>Nome do Criador ou Canil*</label>
              <input
                type="text"
                name="breeder_name"
                value={formData.breeder_name}
                onChange={handleChange}
                placeholder="Nome do criador, nome do canil ou username"
                readOnly={isBreeder}
                required
              />
            </div>
            <div className="form-group">
              <label>Raça*</label>
              <select
                name="breed_id"
                value={formData.breed_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma raça</option>
                {breeds.map(breed => (
                  <option key={breed.id} value={breed.id}>{breed.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Sexo*</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cor</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Microchip ID</label>
              <input
                type="text"
                name="microchip_id"
                value={formData.microchip_id}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Pai (opcional)</label>
              <select
                name="father_id"
                value={formData.father_id}
                onChange={handleChange}
              >
                <option value="">Sem registo</option>
                {dogs
                  .filter((dog) => dog.gender === 'M')
                  .map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.registration_id} - {dog.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Mãe (opcional)</label>
              <select
                name="mother_id"
                value={formData.mother_id}
                onChange={handleChange}
              >
                <option value="">Sem registo</option>
                {dogs
                  .filter((dog) => dog.gender === 'F')
                  .map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.registration_id} - {dog.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Foto do Cão (agente pode tirar foto na hora do registo)</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
              />
              {photoPreviewUrl && (
                <img
                  src={photoPreviewUrl}
                  alt="Pré-visualização"
                  style={{ marginTop: '10px', width: '220px', maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              )}
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'A registar...' : 'Registar Cão'}
            </button>
          </form>
        </div>
      )}

      <table style={{ marginTop: '30px' }}>
        <thead>
          <tr>
            <th>ID Registo</th>
            <th>Nome</th>
            <th>Raça</th>
            <th>Sexo</th>
            <th>Cor</th>
            <th>Pai</th>
            <th>Mãe</th>
            <th>Data Nascimento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dogs.map(dog => (
            <tr key={dog.id}>
              <td><strong>{dog.registration_id}</strong></td>
              <td>{dog.name}</td>
              <td>{dog.breed_name}</td>
              <td>{dog.gender === 'M' ? '♂ Macho' : '♀ Fêmea'}</td>
              <td>{dog.color}</td>
              <td>{dog.father_name || '-'}</td>
              <td>{dog.mother_name || '-'}</td>
              <td>{dog.birth_date}</td>
              <td>
                <Link to={`/dogs/${dog.id}`}>Ver</Link>
                {' | '}
                <Link to={`/pedigree/${dog.registration_id}`}>Pedigree</Link>
                {canDeleteDogs && (
                  <>
                    {' | '}
                    <button
                      type="button"
                      onClick={() => handleDeleteDog(dog)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontWeight: 700,
                        padding: 0,
                      }}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DogsPage;
