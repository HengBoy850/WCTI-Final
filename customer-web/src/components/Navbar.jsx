import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function close() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand" onClick={close}>
          FOOD<span className="brand-mark">S</span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/menu" onClick={close}>Menu</NavLink>
          <NavLink to="/about" onClick={close}>About</NavLink>
          <NavLink to="/contact" onClick={close}>Contact</NavLink>

          {user && user.role === 'customer' && (
            <NavLink to="/my-orders" onClick={close}>My Orders</NavLink>
          )}
          {user && user.role === 'staff' && (
            <NavLink to="/staff" onClick={close}>Staff Dashboard</NavLink>
          )}
          {user && user.role === 'admin' && (
            <NavLink to="/admin" onClick={close}>Admin Dashboard</NavLink>
          )}
          {user && (
            <>
              <span className="role-tag">{user.name} · {user.role}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          )}
          {!user && (
            <div className="nav-links-auth">
              <Link to="/register" className="pill-outline" onClick={close}>Sign up</Link>
              <Link to="/login" className="pill" onClick={close}>Log in</Link>
            </div>
          )}
        </div>

        <div className="navbar-right">
          <Link to="/menu" className="nav-icon-btn" aria-label="Search menu" title="Search menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </Link>
          <Link to="/menu" className="nav-icon-btn" aria-label="View order" title="Your order">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            {itemCount > 0 && <span className="nav-cart-badge">{itemCount}</span>}
          </Link>

          {!user && (
            <div className="navbar-right-auth">
              <Link to="/register" className="pill-outline" onClick={close}>Sign up</Link>
              <Link to="/login" className="pill" onClick={close}>Log in</Link>
            </div>
          )}

          <button
            className="nav-icon-btn nav-hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
