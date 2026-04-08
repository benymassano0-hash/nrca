import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DogsPage from './pages/DogsPage';
import DogDetailPage from './pages/DogDetailPage';
import DogTransferPage from './pages/DogTransferPage';
import PedigreePage from './pages/PedigreePage';
import PublicPedigreeSearchPage from './pages/PublicPedigreeSearchPage';
import BreedingsPage from './pages/BreedingsPage';
import BreedsPage from './pages/BreedsPage';
import AnunciarEventoPage from './pages/AnunciarEventoPage';
import UsersManagementPage from './pages/UsersManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PricesPage from './pages/PricesPage';

// Componentes
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              user
                ? <Navigate to={user.user_type === 'admin' ? '/admin' : '/dashboard'} replace />
                : <LoginPage setUser={setUser} />
            }
          />
          <Route path="/precos" element={<PricesPage />} />
          <Route path="/pedigree-buscar" element={<PublicPedigreeSearchPage />} />
          
          {/* Rotas privadas */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute user={user}>
                {user?.user_type === 'admin' ? <Navigate to="/admin" replace /> : <DashboardPage user={user} />}
              </PrivateRoute>
            }
          />
          <Route 
            path="/dogs" 
            element={<PrivateRoute user={user}><DogsPage /></PrivateRoute>} 
          />
          <Route 
            path="/dogs/:id" 
            element={<PrivateRoute user={user}><DogDetailPage /></PrivateRoute>} 
          />
          <Route 
            path="/transferir-cao" 
            element={<PrivateRoute user={user}><DogTransferPage /></PrivateRoute>} 
          />
          <Route 
            path="/pedigree/:registration_id" 
            element={<PrivateRoute user={user}><PedigreePage /></PrivateRoute>} 
          />
          <Route 
            path="/breedings" 
            element={<PrivateRoute user={user}><BreedingsPage /></PrivateRoute>} 
          />
          <Route 
            path="/breeds" 
            element={<PrivateRoute user={user}><BreedsPage /></PrivateRoute>} 
          />
          <Route 
            path="/anunciar-evento" 
            element={<PrivateRoute user={user}><AnunciarEventoPage /></PrivateRoute>} 
          />
          <Route 
            path="/admin" 
            element={<PrivateRoute user={user} requiredRole="admin"><AdminDashboardPage user={user} /></PrivateRoute>} 
          />
          <Route 
            path="/admin/usuarios" 
            element={<PrivateRoute user={user} requiredRole="admin"><UsersManagementPage /></PrivateRoute>} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
