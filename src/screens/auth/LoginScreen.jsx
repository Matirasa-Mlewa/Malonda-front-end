import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGuestGuard } from '../../context/GuestGuardContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtp } = useAuth();
  const { redirectAfterLogin, clearIntent } = useGuestGuard();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // What action triggered login — show contextual message
  const action = location.state?.action;
  const from   = location.state?.from || redirectAfterLogin?.path || '/';

  const actionMessages = {
    cart:     { icon: '🛒', text: 'Sign in to add items to your cart' },
    chat:     { icon: '💬', text: 'Sign in to chat with this seller' },
    checkout: { icon: '💳', text: 'Sign in to complete your purchase' },
    sell:     { icon: '🏪', text: 'Sign in to list your products' },
    wishlist: { icon: '❤️', text: 'Sign in to save to your wishlist' },
    orders:   { icon: '📦', text: 'Sign in to view your orders' },
    profile:  { icon: '👤', text: 'Sign in to your account' },
  };
  const prompt = actionMessages[action];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    const res = await sendOtp('+265' + phone.replace(/^0/, ''));
    setLoading(false);
    if (res.success) {
      navigate('/otp', {
        state: {
          phone: '+265' + phone.replace(/^0/, ''),
          password,
          from,
          action,
        },
      });
    }
  };

  return (
    <div className="screen screen-white page-fade">
      {/* Header with back-to-browse */}
      <div className="header">
        <button className="header-back" onClick={() => navigate(-1)}>←</button>
        <span className="header-title">Sign In</span>
      </div>

      <div className="scroll" style={{ padding: '24px 20px', flex: 1 }}>

        {/* Contextual prompt if triggered by an action */}
        {prompt ? (
          <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '14px 16px', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>{prompt.icon}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>{prompt.text}</p>
              <p style={{ fontSize: 12, color: 'var(--green)', opacity: 0.8 }}>You can always browse without signing in</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👋</div>
            <p style={{ fontSize: 17, fontWeight: 600 }}>Welcome back!</p>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>Enter your phone number to continue</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-input" style={{ width: 90, flexShrink: 0 }}>
                <option>🇲🇼 +265</option>
              </select>
              <input
                className="form-input"
                type="tel"
                placeholder="088 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ flex: 1 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Sending OTP…' : 'Continue with OTP →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 14 }}>
          <a style={{ color: 'var(--green)', fontSize: 13, cursor: 'pointer' }}>Forgot password?</a>
        </p>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text3)', fontSize: 13 }}>
          No account?{' '}
          <Link
            to="/register"
            state={{ from, action }}
            style={{ color: 'var(--green)', fontWeight: 600 }}
          >
            Register free
          </Link>
        </div>

        {/* Continue browsing link */}
        <button
          onClick={() => navigate(-1)}
          style={{ width: '100%', marginTop: 16, padding: '11px', background: 'var(--gray-light)', border: '1px solid var(--gray-border)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text3)', cursor: 'pointer', fontWeight: 500 }}
        >
          ← Continue browsing without signing in
        </button>

        <div style={{ marginTop: 20, background: 'var(--blue-light)', borderRadius: 10, padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <p style={{ fontSize: 12, color: 'var(--blue)' }}>Your data is encrypted. We never share your details.</p>
        </div>
      </div>
    </div>
  );
}
