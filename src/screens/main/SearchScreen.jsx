import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS, CATEGORIES } from '../../utils/mockData';
import { useAuthGate } from '../../hooks/useAuthGate';

const LOCATIONS = ['All Locations', 'Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu'];
const PRICE_RANGES = ['Any Price', 'Under 5K', '5K – 20K', '20K – 100K', 'Over 100K'];

export default function SearchScreen() {
  const navigate = useNavigate();
  const requireAuth = useAuthGate();
  const [query, setQuery]       = useState('');
  const [location, setLocation] = useState('All Locations');
  const [category, setCategory] = useState('All');
  const [price, setPrice]       = useState('Any Price');

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.desc?.toLowerCase().includes(query.toLowerCase());
    const matchL = location === 'All Locations' || p.location.includes(location);
    const matchC = category === 'All' || p.category === category;
    const matchP =
      price === 'Any Price'    ? true :
      price === 'Under 5K'     ? p.price < 5000 :
      price === '5K – 20K'     ? p.price >= 5000  && p.price <= 20000  :
      price === '20K – 100K'   ? p.price > 20000  && p.price <= 100000 :
      p.price > 100000;
    return matchQ && matchL && matchC && matchP;
  });

  return (
    <div className="page-fade">
      {/* Green search header */}
      <div style={{ background: 'var(--green)', padding: '12px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>←</button>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Explore</p>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            placeholder="Search products, sellers…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 38, background: 'white' }}
            autoFocus
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text3)' }}>✕</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', padding: '10px 12px', borderBottom: '0.5px solid var(--gray-border)', display: 'flex', gap: 8 }}>
        <select className="form-input" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input" value={price} onChange={e => setPrice(e.target.value)} style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}>
          {PRICE_RANGES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 14px' }}>
        {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        {query ? ` for "${query}"` : ''}
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔍</div>
          <p style={{ fontWeight: 600 }}>No products found</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Try different filters or a broader search</p>
        </div>
      ) : (
        <div className="product-grid" style={{ paddingBottom: 80 }}>
          {filtered.map(p => (
            <div key={p.id} className="product-card">
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
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.rating}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '0 8px 8px' }}>
                <button
                  onClick={() => requireAuth(() => navigate('/cart'), 'cart')}
                  style={{ width: '100%', padding: '6px', background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green)', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
