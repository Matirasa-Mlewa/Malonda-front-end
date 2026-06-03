import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestGuard } from '../../context/GuestGuardContext';

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { setIntent } = useGuestGuard();

  // For guest users clicking protected nav tabs, redirect to login with intent
  const handleProtectedTab = (path, action) => {
    if (user) {
      navigate(path);
    } else {
      setIntent(path, action);
      navigate('/login', { state: { from: path, action } });
    }
  };

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Home',
      exact: true,
      public: true,
    },
    {
      path: '/search',
      icon: '🔍',
      label: 'Explore',
      public: true,
    },
    {
      // Cart tab: guests get redirected to login
      path: '/cart',
      icon: '🛒',
      label: 'Cart',
      public: false,
      action: 'cart',
      badge: itemCount > 0 ? itemCount : null,
    },
    {
      path: '/orders',
      icon: '📦',
      label: 'Orders',
      public: false,
      action: 'orders',
    },
    {
      path: '/profile',
      icon: user ? '👤' : '🔑',
      label: user ? 'Profile' : 'Sign In',
      public: false,
      action: 'profile',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, paddingBottom: 64 }}>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          if (item.public) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item${isActive ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          }

          // Protected tab — either navigate or gate
          return (
            <button
              key={item.path}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => handleProtectedTab(item.path, item.action)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span className="nav-icon" style={{ position: 'relative' }}>
                {item.icon}
                {item.badge && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    background: '#c0392b', color: 'white',
                    borderRadius: '50%', minWidth: 15, height: 15,
                    fontSize: 9, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, padding: '0 2px',
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
