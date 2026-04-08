import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import './DogTransferPage.css';

function DogTransferPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOperationPanel = currentUser?.user_type === 'admin' || currentUser?.user_type === 'registration_agent';
  const isBreeder = currentUser?.user_type === 'breeder';

  const [dogs, setDogs] = useState([]);
  const [breeders, setBreeders] = useState([]);
  const [receivedTransfers, setReceivedTransfers] = useState([]);
  const [kennelDogs, setKennelDogs] = useState([]);
  const [transferableDogs, setTransferableDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferTargets, setTransferTargets] = useState({});
  const [transferringDogId, setTransferringDogId] = useState(null);
  const [breederSelectedDog, setBreederSelectedDog] = useState('');
  const [breederSelectedTarget, setBreederSelectedTarget] = useState('');
  const [breederTickets, setBreederTickets] = useState(0);

  useEffect(() => {
    loadTransferData();
  }, []);

  const loadTransferData = async () => {
    try {
      setLoading(true);
      setError('');
      if (isOperationPanel) {
        const [dogsResult, breedersResult] = await Promise.allSettled([
          api.get('/dogs'),
          api.get('/dogs/transfer/breeders'),
        ]);

        if (dogsResult.status === 'fulfilled') {
          setDogs(dogsResult.value.data || []);
        } else {
          setDogs([]);
        }

        if (breedersResult.status === 'fulfilled') {
          setBreeders(breedersResult.value.data || []);
        } else {
          setBreeders([]);
        }

        if (dogsResult.status === 'rejected' || breedersResult.status === 'rejected') {
          const firstError =
            (dogsResult.status === 'rejected' && dogsResult.reason) ||
            (breedersResult.status === 'rejected' && breedersResult.reason);
          const apiMessage = firstError?.response?.data?.error;
          setError(apiMessage || 'Parte dos dados de transferência não pôde ser carregada.');
        }
      } else if (isBreeder) {
        const [overviewResult, breedersResult, profileResult] = await Promise.allSettled([
          api.get('/dogs/transfer/my-overview'),
          api.get('/dogs/transfer/breeders'),
          api.get('/users/profile'),
        ]);

        if (overviewResult.status === 'fulfilled') {
          setReceivedTransfers(overviewResult.value.data?.received_transfers || []);
          setKennelDogs(overviewResult.value.data?.kennel_dogs || []);
          setTransferableDogs(overviewResult.value.data?.transferable_dogs || overviewResult.value.data?.kennel_dogs || []);
        } else {
          setReceivedTransfers([]);
          setKennelDogs([]);
          setTransferableDogs([]);

          // Fallback: mesmo com falha no overview, carregar cães atuais do criador.
          const breederIdFromProfile =
            profileResult.status === 'fulfilled'
              ? profileResult.value.data?.id
              : currentUser?.id;

          if (breederIdFromProfile) {
            try {
              const fallbackDogsRes = await api.get(`/dogs?breeder_id=${breederIdFromProfile}`);
              const fallbackDogs = fallbackDogsRes.data || [];
              setKennelDogs(fallbackDogs);
              setTransferableDogs(fallbackDogs);
            } catch (_) {
              // Mantém listas vazias se até o fallback falhar.
            }
          }
        }

        if (breedersResult.status === 'fulfilled') {
          setBreeders(breedersResult.value.data || []);
        } else {
          setBreeders([]);
        }

        if (profileResult.status === 'fulfilled') {
          setBreederTickets(Number(profileResult.value.data?.tickets || 0));
        } else {
          setBreederTickets(0);
        }

        const firstError =
          (overviewResult.status === 'rejected' && overviewResult.reason) ||
          (breedersResult.status === 'rejected' && breedersResult.reason) ||
          (profileResult.status === 'rejected' && profileResult.reason);

        if (firstError) {
          const apiMessage = firstError?.response?.data?.error;
          setError(apiMessage || 'Parte dos dados de transferência não pôde ser carregada.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados de transferência');
    } finally {
      setLoading(false);
    }
  };

  const dogsWithTransferOptions = useMemo(
    () =>
      dogs.map((dog) => ({
        ...dog,
        availableBreeders: breeders.filter(
          (breeder) => String(breeder.id) !== String(dog.breeder_id)
        ),
      })),
    [dogs, breeders]
  );

  const handleTargetChange = (dogId, breederId) => {
    setTransferTargets((prev) => ({ ...prev, [dogId]: breederId }));
  };

  const handleBreederTransfer = async () => {
    if (!breederSelectedDog || !breederSelectedTarget) {
      setError('Selecione o cão e o novo criador.');
      setSuccess('');
      return;
    }
    try {
      setError('');
      setSuccess('');
      setTransferringDogId(breederSelectedDog);
      const response = await api.post('/dogs/transfer/init', {
        dog_id: breederSelectedDog,
        new_breeder_id: breederSelectedTarget,
      });
      setSuccess(
        `Cão "${response.data.transfer.dog_name}" transferido com sucesso para ${response.data.transfer.new_breeder_name}. Foi consumido 1 ticket.`
      );
      setBreederSelectedDog('');
      setBreederSelectedTarget('');
      await loadTransferData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao transferir cão');
    } finally {
      setTransferringDogId(null);
    }
  };

  const handleTransfer = async (dog) => {
    const selectedBreeder = transferTargets[dog.id];

    if (!selectedBreeder) {
      setError('Selecione o novo criador antes de transferir.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setTransferringDogId(dog.id);

      const response = await api.post('/dogs/transfer/init', {
        dog_id: dog.id,
        new_breeder_id: selectedBreeder,
      });

      setSuccess(
        `Cão "${response.data.transfer.dog_name}" transferido com sucesso para ${response.data.transfer.new_breeder_name}. Foi consumido 1 ticket do criador de origem.`
      );
      setTransferTargets((prev) => ({ ...prev, [dog.id]: '' }));
      await loadTransferData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao transferir cão');
    } finally {
      setTransferringDogId(null);
    }
  };

  if (loading) {
    return <div className="transfer-container"><p>Carregando...</p></div>;
  }

  return (
    <div className="transfer-container">
      <div className="transfer-header">
        <h1>🐕 Transferência de Cães</h1>
        <p>
          {isOperationPanel
            ? 'Veja todos os cães registados e transfira cada cão para outro criador.'
            : 'Transfira os seus cães para outro criador e veja o histórico do seu canil.'}
        </p>
      </div>

      {(isOperationPanel || isBreeder) && (
        <div className="transfer-fee-notice">
          <h3>🎫 Tickets por Transferência</h3>
          <p>Cada transferência consome <strong>1 ticket</strong> do criador de origem.</p>
        </div>
      )}

      {error && !String(error).toLowerCase().includes('visão de transferências do criador') && (
        <div className="alert alert-error">{error}</div>
      )}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="transfer-summary">
        <div className="summary-card">
          <span className="summary-label">{isOperationPanel ? 'Cães registados' : 'Cães no meu canil'}</span>
          <strong>{isOperationPanel ? dogs.length : transferableDogs.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">{isOperationPanel ? 'Criadores disponíveis' : 'Transferidos para mim'}</span>
          <strong>{isOperationPanel ? breeders.length : receivedTransfers.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Operador atual</span>
          <strong>{currentUser?.full_name || currentUser?.username || '-'}</strong>
        </div>
        {isBreeder && (
          <div className="summary-card">
            <span className="summary-label">🎟️ Tickets disponíveis</span>
            <strong style={{ color: breederTickets > 0 ? '#16a34a' : '#dc2626' }}>{breederTickets}</strong>
          </div>
        )}
      </div>

      {isOperationPanel && (dogsWithTransferOptions.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum cão registado encontrado.</p>
        </div>
      ) : (
        <div className="transfer-table-card">
          <div className="transfer-table-wrapper">
            <table className="transfer-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registo</th>
                  <th>Cão</th>
                  <th>Criador Atual</th>
                  <th>ID Criador</th>
                  <th>Novo Criador</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {dogsWithTransferOptions.map((dog) => {
                  const isBusy = transferringDogId === dog.id;

                  return (
                    <tr key={dog.id}>
                      <td>{dog.id}</td>
                      <td><strong>{dog.registration_id || '-'}</strong></td>
                      <td>
                        <div className="dog-cell">
                          <span className="dog-name">{dog.name}</span>
                          <span className="dog-meta">
                            {dog.breed_name || 'Sem raça'} • {dog.gender === 'M' ? 'Macho' : 'Fêmea'}
                          </span>
                        </div>
                      </td>
                      <td>{dog.breeder_name || '-'}</td>
                      <td>{dog.breeder_id || '-'}</td>
                      <td>
                        <select
                          className="form-control inline-select"
                          value={transferTargets[dog.id] || ''}
                          onChange={(e) => handleTargetChange(dog.id, e.target.value)}
                          disabled={isBusy}
                        >
                          <option value="">Selecionar criador</option>
                          {dog.availableBreeders.map((breeder) => (
                            <option key={breeder.id} value={breeder.id}>
                              {breeder.full_name} ({breeder.id})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary inline-transfer-btn"
                          disabled={!transferTargets[dog.id] || isBusy}
                          onClick={() => handleTransfer(dog)}
                        >
                          {isBusy ? 'Transferindo...' : 'Transferir'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {isBreeder && (
        <>
          {/* Formulário de transferência para criadores */}
          <div className="transfer-table-card" style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 8px' }}>🔄 Transferir um Cão</h3>
            {breederTickets < 1 && (
              <p style={{ margin: '0 0 12px', color: '#dc2626', fontWeight: 600 }}>
                ⚠️ Sem tickets disponíveis. Contacte o administrador para carregar tickets.
              </p>
            )}
            {transferableDogs.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>Não tem cães no canil para transferir.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.88rem', fontWeight: 600 }}>Cão a transferir</label>
                  <select
                    className="form-control inline-select"
                    value={breederSelectedDog}
                    onChange={(e) => setBreederSelectedDog(e.target.value)}
                    disabled={!!transferringDogId}
                  >
                    <option value="">Selecionar cão</option>
                    {transferableDogs.map((dog) => (
                      <option key={dog.id} value={dog.id}>
                        {dog.name} {dog.registration_id ? `(${dog.registration_id})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.88rem', fontWeight: 600 }}>Novo criador</label>
                  <select
                    className="form-control inline-select"
                    value={breederSelectedTarget}
                    onChange={(e) => setBreederSelectedTarget(e.target.value)}
                    disabled={!!transferringDogId}
                  >
                    <option value="">Selecionar criador</option>
                    {breeders.map((b) => (
                      <option key={b.id} value={b.id}>{b.full_name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-primary inline-transfer-btn"
                  disabled={!breederSelectedDog || !breederSelectedTarget || !!transferringDogId || breederTickets < 1}
                  onClick={handleBreederTransfer}
                >
                  {transferringDogId ? 'Transferindo...' : '🔄 Transferir (1 ticket)'}
                </button>
              </div>
            )}
          </div>

          <div className="transfer-table-card" style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 12px' }}>📥 Cães Transferidos Para Mim</h3>
            {receivedTransfers.length === 0 ? (
              <p>Nenhuma transferência recebida até ao momento.</p>
            ) : (
              <div className="transfer-table-wrapper">
                <table className="transfer-table">
                  <thead>
                    <tr>
                      <th>Data da Transferência</th>
                      <th>Cão</th>
                      <th>Registo</th>
                      <th>Raça</th>
                      <th>Veio de</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedTransfers.map((item) => (
                      <tr key={item.id}>
                        <td>{item.transfer_date}</td>
                        <td>{item.dog_name}</td>
                        <td><strong>{item.registration_id || '-'}</strong></td>
                        <td>{item.breed_name || '-'}</td>
                        <td>{item.old_breeder_name || item.old_breeder_username || 'Origem não informada'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="transfer-table-card" style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 12px' }}>🏡 Todos os Cães no Meu Canil</h3>
            {transferableDogs.length === 0 ? (
              <p>Não há cães associados ao seu canil.</p>
            ) : (
              <div className="transfer-table-wrapper">
                <table className="transfer-table">
                  <thead>
                    <tr>
                      <th>Registo</th>
                      <th>Nome</th>
                      <th>Raça</th>
                      <th>Sexo</th>
                      <th>Nascimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferableDogs.map((dog) => (
                      <tr key={dog.id}>
                        <td><strong>{dog.registration_id || '-'}</strong></td>
                        <td>{dog.name}</td>
                        <td>{dog.breed_name || '-'}</td>
                        <td>{dog.gender === 'M' ? 'Macho' : 'Fêmea'}</td>
                        <td>{dog.birth_date || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <div className="info-box">
        <h3>💡 Informações</h3>
        <ul>
          {isOperationPanel ? (
            <>
              <li>A lista mostra todos os cães registados no sistema.</li>
              <li>Cada linha exibe o nome do cão, ID do registo e criador atual.</li>
              <li>Cada transferência consome 1 ticket do criador de origem.</li>
              <li>Selecione o novo criador e clique em transferir para concluir a operação.</li>
              <li>O histórico genealógico do cão continua preservado após a transferência.</li>
            </>
          ) : (
            <>
              <li>Use o formulário acima para transferir um dos seus cães para outro criador (consome 1 ticket).</li>
              <li>A secção "Cães Transferidos Para Mim" mostra os cães que entraram no seu canil por transferência.</li>
              <li>A secção "Todos os Cães no Meu Canil" mostra o inventário completo atual do seu canil.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DogTransferPage;
