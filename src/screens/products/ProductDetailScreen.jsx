import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuthGate } from '../../hooks/useAuthGate';
import { MOCK_PRODUCTS } from '../../utils/mockData';
import TrustBadge from '../../components/trust/TrustBadge';

export default function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const requireAuth = useAuthGate();
  const product = MOCK_PRODUCTS.find(p => String(p.id) === String(id)) || MOCK_PRODUCTS[0];
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = () => {
    requireAuth(() => {
      addItem(product);
      navigate('/cart');
    }, 'cart');
  };

  const handleChat = () => {
    requireAuth(() => navigate('/messages/' + product.sellerId), 'chat');
  };

  return (
    <div className="screen screen-white page-fade" style={{ paddingBottom: 0 }}>
      <div className="header">
        <button className="header-back" onClick={() => navigate(-1)}>←</button>
        <span className="header-title">Product Details</span>
        <button className="header-action" onClick={() => requireAuth(() => setWishlisted(w => !w), 'wishlist')}>
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, paddingBottom: 100 }}>
        <div style={{ height: 220, background: 'linear-gradient(135deg,#e8f5ee,#c8e6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90 }}>
          {product.emoji}
        </div>

        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 10 }}>
              <p style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3 }}>{product.name}</p>
              <p style={{ fontSize: 23, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>
                MK {product.price.toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="stars">{'★'.repeat(Math.round(product.rating))}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{product.rating} ({product.reviews})</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <TrustBadge level={product.sellerBadge} />
            {product.inEscrow && <span className="badge-escrow">🔒 Escrow Protected</span>}
            <span className="pill pill-gray">📍 {product.location}</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
            {product.desc}
          </p>

          <div className="divider" />

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', cursor: 'pointer' }}
            onClick={() => navigate('/seller/' + product.sellerId)}
          >
            <div className="avatar avatar-md">{product.seller.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{product.seller}</p>
              <p style={{ fontSize: 11, color: 'var(--text3)' }}>Tap to view seller profile</p>
            </div>
            <TrustBadge level={product.sellerBadge} />
          </div>

          <div className="divider" />

          <div style={{ padding: '12px 0' }}>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Delivery</p>
            <p style={{ fontSize: 13 }}>🚚 {product.delivery}</p>
          </div>

          {product.inEscrow && (
            <div className="escrow-banner" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>🔒</span>
              <p>Pay safely — funds held in escrow until you confirm delivery.</p>
            </div>
          )}

          {/* CTA buttons — both auth-gated */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleChat}>
              💬 Chat with Seller
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderTop: '0.5px solid var(--gray-border)', padding: '10px 16px', display: 'flex', gap: 10, zIndex: 50 }}>
        <button className="btn btn-outline" style={{ flex: 1, padding: 11 }} onClick={handleChat}>💬 Chat</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddToCart}>
          Buy Now — MK {product.price.toLocaleString()}
        </button>
      </div>
    </div>
  );
}
