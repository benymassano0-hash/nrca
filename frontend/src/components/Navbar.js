import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoImage, setShowLogoImage] = useState(true);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    closeMobileMenu();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          {showLogoImage ? (
            <img
              src="/logo-oficial.jpeg"
              alt="Logo RCA"
              className="navbar-logo-image"
              onError={() => setShowLogoImage(false)}
            />
          ) : (
            <span className="navbar-logo-fallback">🐕 RCA</span>
          )}
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label="Abrir menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={closeMobileMenu}>Início</Link></li>
          <li><Link to="/precos" onClick={closeMobileMenu}>💰 Preços</Link></li>
          <li><Link to="/pedigree-buscar" onClick={closeMobileMenu}>🔍 Pedigree</Link></li>
          <li><Link to="/caes-venda" onClick={closeMobileMenu}>💸 Cães à Venda</Link></li>
          {user ? (
            <>
              <li><Link to="/dogs" onClick={closeMobileMenu}>Cães</Link></li>
              <li><Link to="/anunciar-venda" onClick={closeMobileMenu}>📣 Anunciar Venda</Link></li>
              <li><Link to="/transferir-cao" onClick={closeMobileMenu}>🔄 Transferir</Link></li>
              <li><Link to="/breedings" onClick={closeMobileMenu}>Cruzamentos</Link></li>
              <li><Link to="/breeds" onClick={closeMobileMenu}>Raças</Link></li>
              <li><Link to="/anunciar-evento" onClick={closeMobileMenu}>📢 Anunciar Evento</Link></li>
              <li><Link to={user.user_type === 'admin' ? '/admin' : '/dashboard'} onClick={closeMobileMenu}>Dashboard</Link></li>
              {user.user_type === 'admin' && (
                <li><Link to="/admin" onClick={closeMobileMenu}>⚙️ Painel Admin</Link></li>
              )}
              <li>
                <button onClick={handleLogout}>Logout ({user.username})</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={closeMobileMenu}>Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
