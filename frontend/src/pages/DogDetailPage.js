import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function DogDetailPage() {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [allDogs, setAllDogs] = useState([]);
  const [editingDog, setEditingDog] = useState(false);
  const [savingDog, setSavingDog] = useState(false);
  const [dogFormError, setDogFormError] = useState('');
  const [dogFormSuccess, setDogFormSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [dogForm, setDogForm] = useState({
    name: '',
    breed_id: '',
    birth_date: '',
    gender: 'M',
    color: '',
    microchip_id: '',
    father_id: '',
    mother_id: '',
    health_status: '',
    notes: '',
  });
  const [vaccines, setVaccines] = useState([]);
  const [vaccineError, setVaccineError] = useState('');
  const [vaccineSuccess, setVaccineSuccess] = useState('');
  const [savingVaccine, setSavingVaccine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vaccineForm, setVaccineForm] = useState({
    vaccine_name: '',
    vaccine_date: '',
    next_due_date: '',
    veterinarian_name: '',
    notes: '',
  });
  const backendBaseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canManageHealth = currentUser?.user_type === 'admin' || currentUser?.user_type === 'registration_agent' || currentUser?.user_type === 'breeder';
  const canEditRegistration = currentUser?.user_type === 'admin' || currentUser?.user_type === 'registration_agent' || currentUser?.user_type === 'breeder';

  useEffect(() => {
    loadDog();
    loadMetadata();
  }, [id]);

  const loadDog = async () => {
    try {
      const response = await api.get(`/dogs/${id}`);
      setDog(response.data);
      setDogForm({
        name: response.data.name || '',
        breed_id: response.data.breed_id || '',
        birth_date: response.data.birth_date || '',
        gender: response.data.gender || 'M',
        color: response.data.color || '',
        microchip_id: response.data.microchip_id || '',
        father_id: response.data.father_id || '',
        mother_id: response.data.mother_id || '',
        health_status: response.data.health_status || '',
        notes: response.data.notes || '',
      });
      loadVaccines(response.data.id);
    } catch (err) {
      setError('Erro ao carregar cão');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [breedsResponse, dogsResponse] = await Promise.all([
        api.get('/breeds'),
        api.get('/dogs'),
      ]);
      setBreeds(breedsResponse.data || []);
      setAllDogs(dogsResponse.data || []);
    } catch (err) {
      // metadados são auxiliares; manter silencioso
    }
  };

  const handleDogFormChange = (e) => {
    const { name, value } = e.target;
    setDogForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDogPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      return;
    }
    setSelectedPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveDog = async (e) => {
    e.preventDefault();
    setDogFormError('');
    setDogFormSuccess('');
    setSavingDog(true);

    try {
      const payload = new FormData();
      payload.append('name', dogForm.name);
      payload.append('breed_id', dogForm.breed_id);
      payload.append('birth_date', dogForm.birth_date || '');
      payload.append('gender', dogForm.gender);
      payload.append('color', dogForm.color || '');
      payload.append('microchip_id', dogForm.microchip_id || '');
      payload.append('father_id', dogForm.father_id || '');
      payload.append('mother_id', dogForm.mother_id || '');
      payload.append('health_status', dogForm.health_status || '');
      payload.append('notes', dogForm.notes || '');
      if (selectedPhoto) {
        payload.append('photo', selectedPhoto);
      }

      await api.put(`/dogs/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDogFormSuccess('Registo do cão atualizado com sucesso.');
      setEditingDog(false);
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      await loadDog();
    } catch (err) {
      setDogFormError(err.response?.data?.error || 'Erro ao atualizar registo do cão');
    } finally {
      setSavingDog(false);
    }
  };

  const loadVaccines = async (dogId) => {
    try {
      const response = await api.get(`/vaccines/dog/${dogId}`);
      setVaccines(response.data);
    } catch (err) {
      setVaccineError('Não foi possível carregar histórico de vacinas');
    }
  };

  const handleVaccineFormChange = (e) => {
    const { name, value } = e.target;
    setVaccineForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    setVaccineError('');
    setVaccineSuccess('');
    setSavingVaccine(true);

    try {
      await api.post('/vaccines', {
        dog_id: dog.id,
        vaccine_name: vaccineForm.vaccine_name,
        vaccine_date: vaccineForm.vaccine_date,
        next_due_date: vaccineForm.next_due_date || null,
        veterinarian_name: vaccineForm.veterinarian_name || null,
        notes: vaccineForm.notes || null,
      });
      setVaccineSuccess('Vacina registada com sucesso.');
      setVaccineForm({
        vaccine_name: '',
        vaccine_date: '',
        next_due_date: '',
        veterinarian_name: '',
        notes: '',
      });
      loadVaccines(dog.id);
    } catch (err) {
      setVaccineError(err.response?.data?.error || 'Erro ao registar vacina');
    } finally {
      setSavingVaccine(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!dog) return <div className="error">Cão não encontrado</div>;

  return (
    <div>
      <h1>{dog.name}</h1>

      {canEditRegistration && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Registo do Cão</h3>
            {!editingDog ? (
              <button type="button" onClick={() => setEditingDog(true)}>✏️ Editar Registo</button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingDog(false);
                  setDogFormError('');
                  setPhotoPreviewUrl('');
                  setSelectedPhoto(null);
                }}
                style={{ backgroundColor: '#64748b' }}
              >
                Cancelar
              </button>
            )}
          </div>

          {dogFormError && <div className="error">{dogFormError}</div>}
          {dogFormSuccess && <div className="success">{dogFormSuccess}</div>}

          {editingDog && (
            <form onSubmit={handleSaveDog} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Nome*</label>
                <input name="name" value={dogForm.name} onChange={handleDogFormChange} required />
              </div>
              <div className="form-group">
                <label>Raça*</label>
                <select name="breed_id" value={dogForm.breed_id} onChange={handleDogFormChange} required>
                  <option value="">Selecione a raça</option>
                  {breeds.map((breed) => (
                    <option key={breed.id} value={breed.id}>{breed.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input type="date" name="birth_date" value={dogForm.birth_date || ''} onChange={handleDogFormChange} />
              </div>
              <div className="form-group">
                <label>Sexo*</label>
                <select name="gender" value={dogForm.gender} onChange={handleDogFormChange}>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cor</label>
                <input name="color" value={dogForm.color || ''} onChange={handleDogFormChange} />
              </div>
              <div className="form-group">
                <label>Microchip</label>
                <input name="microchip_id" value={dogForm.microchip_id || ''} onChange={handleDogFormChange} />
              </div>
              <div className="form-group">
                <label>Pai (opcional)</label>
                <select name="father_id" value={dogForm.father_id || ''} onChange={handleDogFormChange}>
                  <option value="">Sem registo</option>
                  {allDogs.filter((candidate) => candidate.id !== dog.id && candidate.gender === 'M').map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.registration_id} - {candidate.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Mãe (opcional)</label>
                <select name="mother_id" value={dogForm.mother_id || ''} onChange={handleDogFormChange}>
                  <option value="">Sem registo</option>
                  {allDogs.filter((candidate) => candidate.id !== dog.id && candidate.gender === 'F').map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.registration_id} - {candidate.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado de Saúde</label>
                <input name="health_status" value={dogForm.health_status || ''} onChange={handleDogFormChange} />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea name="notes" value={dogForm.notes || ''} onChange={handleDogFormChange} />
              </div>
              <div className="form-group">
                <label>Nova foto do cão (opcional)</label>
                <input type="file" accept="image/*" onChange={handleDogPhotoChange} />
                {photoPreviewUrl && (
                  <img
                    src={photoPreviewUrl}
                    alt="Pré-visualização"
                    style={{ marginTop: '10px', width: '220px', maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                )}
              </div>
              <button type="submit" disabled={savingDog}>
                {savingDog ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </form>
          )}
        </div>
      )}

      {dog.photo_url && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Foto</h3>
          <img
            src={`${backendBaseUrl}${dog.photo_url}`}
            alt={`Foto de ${dog.name}`}
            style={{ width: '320px', maxWidth: '100%', borderRadius: '14px', border: '1px solid #e2e8f0' }}
          />
        </div>
      )}
      {dog.qr_code_url && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>QR Code do Cão</h3>
          <img
            src={`${backendBaseUrl}${dog.qr_code_url}`}
            alt={`QR Code de ${dog.name}`}
            style={{ width: '220px', maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
          />
          <p style={{ marginTop: '10px', color: '#475569' }}>
            Use este QR Code para consultar o registo rapidamente.
          </p>
        </div>
      )}
      <div className="card">
        <h3>Informações Básicas</h3>
        <p><strong>ID de Registo:</strong> {dog.registration_id}</p>
        <p><strong>Raça:</strong> {dog.breed_name}</p>
        <p><strong>Sexo:</strong> {dog.gender === 'M' ? '♂ Macho' : '♀ Fêmea'}</p>
        <p><strong>Cor:</strong> {dog.color}</p>
        <p><strong>Data de Nascimento:</strong> {dog.birth_date}</p>
        <p><strong>Microchip:</strong> {dog.microchip_id || '-'}</p>
        <p><strong>Criador:</strong> {dog.breeder_name}</p>
      </div>

      {(dog.father_name || dog.mother_name) && (
        <div className="card">
          <h3>Genealogia Imediata</h3>
          <p><strong>Pai:</strong> {dog.father_name || '-'}</p>
          <p><strong>Mãe:</strong> {dog.mother_name || '-'}</p>
        </div>
      )}

      {dog.health_status && (
        <div className="card">
          <h3>Saúde</h3>
          <p>{dog.health_status}</p>
        </div>
      )}

      <div className="card">
        <h3>Vacinas e Saúde</h3>
        {vaccineError && <div className="error">{vaccineError}</div>}
        {vaccineSuccess && <div className="success">{vaccineSuccess}</div>}

        {canManageHealth && (
          <form onSubmit={handleAddVaccine} style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label>Nome da Vacina*</label>
              <input
                type="text"
                name="vaccine_name"
                value={vaccineForm.vaccine_name}
                onChange={handleVaccineFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Data da Vacina*</label>
              <input
                type="date"
                name="vaccine_date"
                value={vaccineForm.vaccine_date}
                onChange={handleVaccineFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Próxima Vacina</label>
              <input
                type="date"
                name="next_due_date"
                value={vaccineForm.next_due_date}
                onChange={handleVaccineFormChange}
              />
            </div>
            <div className="form-group">
              <label>Veterinário</label>
              <input
                type="text"
                name="veterinarian_name"
                value={vaccineForm.veterinarian_name}
                onChange={handleVaccineFormChange}
              />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea
                name="notes"
                value={vaccineForm.notes}
                onChange={handleVaccineFormChange}
              />
            </div>
            <button type="submit" disabled={savingVaccine}>
              {savingVaccine ? 'A gravar...' : 'Adicionar Vacina'}
            </button>
          </form>
        )}

        {vaccines.length === 0 ? (
          <p>Sem vacinas registadas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vacina</th>
                <th>Data</th>
                <th>Próxima</th>
                <th>Veterinário</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map(vaccine => (
                <tr key={vaccine.id}>
                  <td>{vaccine.vaccine_name}</td>
                  <td>{vaccine.vaccine_date}</td>
                  <td>{vaccine.next_due_date || '-'}</td>
                  <td>{vaccine.veterinarian_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dog.notes && (
        <div className="card">
          <h3>Notas</h3>
          <p>{dog.notes}</p>
        </div>
      )}
    </div>
  );
}

export default DogDetailPage;
