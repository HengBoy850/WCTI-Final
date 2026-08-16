import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, ClipboardList, UtensilsCrossed, Tags, BarChart3, Users, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linksByRole = {
  cashier: [
    { to: '/pos', label: 'New Order', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
  ],
  staff: [
    { to: '/orders', label: 'Kitchen Orders', icon: ClipboardList },
  ],
  admin: [
    { to: '/pos', label: 'New Order', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
    { to: '/menu', label: 'Menu Items', icon: UtensilsCrossed },
    { to: '/categories', label: 'Categories', icon: Tags },
    { to: '/reports', label: 'Sales Reports', icon: BarChart3 },
    { to: '/accounts', label: 'Accounts', icon: Users },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linksByRole[user?.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="dot" />
        Savory POS
      </div>

      <div className="sidebar-section">Workspace</div>
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Icon />
          {label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar-circle">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
          </div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Log out
        </button>
      </div>
    </aside>
  );
}
