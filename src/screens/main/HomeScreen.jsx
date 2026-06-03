import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestGuard } from '../../context/GuestGuardContext';
import { useAuthGate } from '../../hooks/useAuthGate';
import { MOCK_PRODUCTS, CATEGORIES } from '../../utils/mockData';

const LOCATIONS = ['Nearby', 'Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu'];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const requireAuth = useAuthGate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLocation, setActiveLocation] = useState('Nearby');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchLoc = activeLocation === 'Nearby' || p.location.includes(activeLocation);
    const matchQ   = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchLoc && matchQ;
  });

  return (
    <div className="page-fade">
      {/* ── Header ── */}
      <div style={{ background: 'var(--green)', padding: '12px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="logo" style={{ fontSize: 22 }}>Ma<span>lo</span>nda</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
              📍 {user?.location || 'Lilongwe, Malawi'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {user ? (
              <>
                <button className="header-action" style={{ position: 'relative' }}
                  onClick={() => navigate('/notifications')}>
                  🔔
                </button>
                <button className="header-action" onClick={() => navigate('/messages')}>💬</button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.6)',
                  color: 'white', borderRadius: 20, padding: '6px 14px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            placeholder="Search products, sellers…"
            style={{ paddingLeft: 38, background: 'white' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text3)' }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── Location filter ── */}
      <div style={{ padding: '8px 12px 0', display: 'flex', gap: 6, overflowX: 'auto', background: 'white', scrollbarWidth: 'none' }}>
        {LOCATIONS.map(loc => (
          <button key={loc} onClick={() => setActiveLocation(loc)} style={{
            background: activeLocation === loc ? 'var(--blue)' : 'white',
            color: activeLocation === loc ? 'white' : 'var(--text3)',
            border: `1px solid ${activeLocation === loc ? 'var(--blue)' : 'var(--gray-border)'}`,
            borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 500,
            whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
          }}>
            {loc === 'Nearby' ? '📍 ' : ''}{loc}
          </button>
        ))}
      </div>

      {/* ── Category pills ── */}
      <div style={{ padding: '8px 12px 6px', display: 'flex', gap: 8, overflowX: 'auto', background: 'white', borderBottom: '0.5px solid var(--gray-border)', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? 'var(--green)' : 'white',
            color: activeCategory === cat ? 'white' : 'var(--text3)',
            border: `1px solid ${activeCategory === cat ? 'var(--green)' : 'var(--gray-border)'}`,
            borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 500,
            whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
          }}>{cat}</button>
        ))}
      </div>

      {/* ── Guest welcome banner ── */}
      {!user && (
        <div style={{ margin: '10px 12px 0', background: 'var(--green-light)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>👋</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Welcome to Malonda!</p>
            <p style={{ fontSize: 11, color: 'var(--green)', opacity: 0.8 }}>Browse freely. Sign in to buy, sell or chat.</p>
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{ background: 'var(--green)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Join Free
          </button>
        </div>
      )}

      {/* ── Section header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px 2px' }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>
          {searchQuery
            ? `Results for "${searchQuery}"`
            : activeCategory === 'All'
            ? `${activeLocation === 'Nearby' ? '📍 Nearby' : activeLocation} Products`
            : activeCategory}
          <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 12, marginLeft: 6 }}>
            ({filtered.length})
          </span>
        </p>
        <button onClick={() => navigate('/search')} style={{ fontSize: 12, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          See all →
        </button>
      </div>

      {/* ── Products grid ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔍</div>
          <p style={{ fontWeight: 600 }}>No products found</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Try a different category or location</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map(p => (
            <HomeProductCard
              key={p.id}
              product={p}
              onAddToCart={() => requireAuth(() => {
                navigate('/cart');
              }, 'cart')}
            />
          ))}
        </div>
      )}

      {/* ── Sell CTA for guests ── */}
      {!user && (
        <div style={{ margin: '4px 12px 8px', background: 'var(--green)', borderRadius: 14, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>🏪</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Start Selling Today</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>List your products and reach buyers across Malawi</p>
          </div>
          <button
            onClick={() => requireAuth(() => navigate('/product/add'), 'sell')}
            style={{ background: 'white', color: 'var(--green)', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Sell Now
          </button>
        </div>
      )}

      {/* ── Escrow trust banner ── */}
      <div style={{ margin: '4px 12px 80px', background: 'var(--blue-light)', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 30 }}>🔒</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>Escrow Protected Payments</p>
          <p style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.85 }}>Money held safely until you confirm delivery</p>
        </div>
      </div>
    </div>
  );
}

// ── Inline product card with auth-gated "Add to Cart" ──────────────────────
function HomeProductCard({ product: p, onAddToCart }) {
  const navigate = useNavigate();
  const requireAuth = useAuthGate();

  return (
    <div className="product-card">
      {/* Tapping the image/info goes to detail (public) */}
      <div onClick={() => navigate('/product/' + p.id)} style={{ cursor: 'pointer' }}>
        <div className="product-img">
          {p.emoji}
          {p.sellerBadge === 'trusted'  && <div className="seller-tag tag-trusted">⭐ Trusted</div>}
          {p.sellerBadge === 'verified' && <div className="seller-tag tag-verified">✓ Verified</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{p.name}</div>
          <div className="product-price">MK {p.price.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>📍 {p.location.split(',')[0]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
            <span className="stars" style={{ fontSize: 11 }}>★</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.rating} ({p.reviews})</span>
          </div>
        </div>
      </div>

      {/* Add to cart — auth-gated */}
      <div style={{ padding: '0 8px 8px' }}>
        <button
          onClick={() => requireAuth(() => navigate('/cart'), 'cart')}
          style={{
            width: '100%', padding: '6px', background: 'var(--green-light)',
            color: 'var(--green)', border: '1px solid var(--green)', borderRadius: 8,
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}
