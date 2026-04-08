import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './DashboardPage.css';

function DashboardPage({ user }) {
  const [stats, setStats] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [dogsByBreed, setDogsByBreed] = useState({});
  const [myMonthlyRegistrations, setMyMonthlyRegistrations] = useState([]);
  const [breederWalletInfo, setBreederWalletInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadBreeds();
    if (user.user_type === 'registration_agent') {
      loadMyMonthlyRegistrations();
    }
    if (user.user_type === 'breeder') {
      loadBreederWalletInfo();
    }
  }, []);

  const loadStats = async () => {
    try {
      const isOperationPanel = user.user_type === 'admin' || user.user_type === 'registration_agent';
      const dogsEndpoint = isOperationPanel ? '/dogs' : '/dogs?breeder_id=' + user.id;
      const breedingsEndpoint = isOperationPanel ? '/breedings' : '/breedings?breeder_id=' + user.id;

      const [dogsRes, breedingsRes, breedsRes] = await Promise.all([
        api.get(dogsEndpoint),
        api.get(breedingsEndpoint),
        api.get('/breeds'),
      ]);

      setStats({
        totalDogs: dogsRes.data.length,
        totalBreedings: breedingsRes.data.length,
        totalBreeds: breedsRes.data.length,
      });

      // Contar cães por raça
      const breedCount = {};
      dogsRes.data.forEach((dog) => {
        const breedId = dog.breed_id;
        breedCount[breedId] = (breedCount[breedId] || 0) + 1;
      });
      setDogsByBreed(breedCount);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBreeds = async () => {
    try {
      const response = await api.get('/breeds');
      setBreeds(response.data);
    } catch (error) {
      console.error('Erro ao carregar raças:', error);
    }
  };

  const loadMyMonthlyRegistrations = async () => {
    try {
      const response = await api.get('/users/agents/me/stats/monthly');
      setMyMonthlyRegistrations(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar registos mensais do agente:', error);
    }
  };

  const loadBreederWalletInfo = async () => {
    try {
      const profileRes = await api.get('/users/profile');
      setBreederWalletInfo({
        tickets: Number(profileRes.data?.tickets || 0),
        dog_limit: Number(profileRes.data?.dog_limit || 0),
      });
    } catch (error) {
      console.error('Erro ao carregar tickets do criador:', error);
      setBreederWalletInfo({
        tickets: 0,
        dog_limit: 0,
      });
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  const breedEntries = breeds
    .map((breed) => ({
      id: breed.id,
      name: breed.name,
      count: dogsByBreed[breed.id] || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const maxBreedCount = Math.max(1, ...breedEntries.map((item) => item.count));
  const maxMonthlyCount = Math.max(
    1,
    ...myMonthlyRegistrations.map((item) => Number(item.registrations || 0))
  );
  const totalDogsForShare = Math.max(1, Number(stats?.totalDogs || 0));
  const totalMonthlyForShare = Math.max(
    1,
    myMonthlyRegistrations.reduce((acc, item) => acc + Number(item.registrations || 0), 0)
  );

  const availableTickets = Number(breederWalletInfo?.tickets || 0);
  const breederCurrentDogs = Number(stats?.totalDogs || 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏠 Dashboard</h1>
        <p>Bem-vindo, <strong>{user.full_name || user.username}</strong>!</p>
      </div>

      {(user.user_type === 'admin' || user.user_type === 'registration_agent') && (
        <div className="quick-actions">
          <h2>⚡ Painel de Registo</h2>
          <p>Registe rapidamente cães e ninhadas a partir deste painel.</p>
          <div className="quick-actions-grid">
            <Link to="/dogs" className="quick-action-card">
              <h3>🐕 Adicionar Registo de Cão</h3>
              <span>Ir para cadastro e gestão de cães</span>
            </Link>
            <Link to="/breedings" className="quick-action-card">
              <h3>👶 Adicionar Registo de Ninhada</h3>
              <span>Ir para registo e gestão de ninhadas</span>
            </Link>
          </div>
        </div>
      )}

      {user.user_type === 'breeder' && breederWalletInfo && (
        <div className="breeder-tickets-panel">
          <div className="chart-panel-header">
            <div>
              <h2>🎟️ Tickets de Registo de Cães</h2>
              <p className="chart-panel-subtitle">Cada registo de cão consome 1 ticket automaticamente.</p>
            </div>
          </div>
          <div className="tickets-grid">
            <div className="ticket-card ticket-card-highlight">
              <h3>✅ Tickets Disponíveis</h3>
              <p>{availableTickets}</p>
            </div>
          </div>
          <p className="tickets-help-text">
            Registos já feitos: <strong>{breederCurrentDogs}</strong>
            {' '}| Tickets na conta: <strong>{availableTickets}</strong>
          </p>
        </div>
      )}

      {user.user_type === 'registration_agent' && (
        <div className="agent-monthly-panel">
          <div className="chart-panel-header">
            <div>
              <h2>📅 Registos por Mês</h2>
              <p className="chart-panel-subtitle">Produção mensal do agente (últimos meses com atividade)</p>
            </div>
          </div>
          {myMonthlyRegistrations.length === 0 ? (
            <p className="no-data">Sem registos ainda.</p>
          ) : (
            <div className="professional-chart-list">
              {myMonthlyRegistrations.map((item, index) => {
                const registrations = Number(item.registrations || 0);
                const width = Math.max(
                  6,
                  Math.round((registrations / maxMonthlyCount) * 100)
                );
                const share = Math.round((registrations / totalMonthlyForShare) * 100);

                return (
                  <div className="professional-chart-item" key={`${item.month}-${index}`}>
                    <div className="professional-chart-head">
                      <div className="professional-chart-labels">
                        <span className="professional-chart-title">{item.month}</span>
                        <span className="professional-chart-meta">{share}% do total</span>
                      </div>
                      <strong>{registrations}</strong>
                    </div>
                    <div className="professional-chart-track">
                      <div
                        className="professional-chart-bar"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {stats && (
        <>
          {/* Estatísticas Rápidas */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>🐕 Cães Registados</h3>
              <p className="stat-number">{stats.totalDogs}</p>
            </div>
            <div className="stat-card">
              <h3>👨‍👩‍👧‍👦 Cruzamentos</h3>
              <p className="stat-number">{stats.totalBreedings}</p>
            </div>
            <div className="stat-card">
              <h3>🐾 Raças</h3>
              <p className="stat-number">{stats.totalBreeds}</p>
            </div>
          </div>

          {/* Gráfico de distribuição por raça */}
          <div className="breed-distribution-panel">
            <div className="chart-panel-header">
              <div>
                <h2>📈 Top Raças por Registo</h2>
                <p className="chart-panel-subtitle">Top 8 raças com maior volume de registos</p>
              </div>
            </div>
            {breedEntries.length === 0 ? (
              <p className="no-data">Sem dados de distribuição no momento.</p>
            ) : (
              <div className="professional-chart-list">
                {breedEntries.map((breed, index) => {
                  const width = Math.max(
                    6,
                    Math.round((breed.count / maxBreedCount) * 100)
                  );
                  const share = Math.round((breed.count / totalDogsForShare) * 100);

                  return (
                    <div className="professional-chart-item" key={breed.id}>
                      <div className="professional-chart-head">
                        <div className="professional-chart-labels">
                          <span className="professional-rank">#{index + 1}</span>
                          <span className="professional-chart-title">{breed.name}</span>
                          <span className="professional-chart-meta">{share}% do total</span>
                        </div>
                        <strong>{breed.count}</strong>
                      </div>
                      <div className="professional-chart-track">
                        <div
                          className="professional-chart-bar professional-chart-bar-accent"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Informações de Raças */}
          <div className="breeds-section">
            <h2>📊 Informações por Raça</h2>
            {breeds.length > 0 ? (
              <div className="breeds-grid">
                {breeds.map((breed, index) => (
                  <div key={breed.id} className="breed-card">
                    <div className="breed-number">{index + 1}</div>
                    <div className="breed-info">
                      <h3>{breed.name}</h3>
                      <div className="breed-stats">
                        <div className="breed-stat">
                          <span className="stat-label">Cães Registados:</span>
                          <span className="stat-value">{dogsByBreed[breed.id] || 0}</span>
                        </div>
                        {breed.origin && (
                          <div className="breed-stat">
                            <span className="stat-label">Origem:</span>
                            <span className="stat-value">{breed.origin}</span>
                          </div>
                        )}
                        {breed.size && (
                          <div className="breed-stat">
                            <span className="stat-label">Tamanho:</span>
                            <span className="stat-value">{breed.size}</span>
                          </div>
                        )}
                        {breed.temperament && (
                          <div className="breed-stat">
                            <span className="stat-label">Temperamento:</span>
                            <span className="stat-value">{breed.temperament}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Nenhuma raça registada</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
