import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGuestGuard } from '../../context/GuestGuardContext';

export default function OtpScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, login } = useAuth();
  const { clearIntent } = useGuestGuard();

  const phone  = location.state?.phone || '';
  const password = location.state?.password || '';
  const from   = location.state?.from || '/';
  const action = location.state?.action;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return;
    setLoading(true);
    const verifyRes = await verifyOtp(phone, otp);
    if (verifyRes.success) {
      const loginRes = await login(phone, password);
      if (loginRes.success) {
        clearIntent();
        // Return user to where they were trying to go
        navigate(from || '/', { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <div className="screen screen-white page-fade">
      <div className="header">
        <button className="header-back" onClick={() => navigate(-1)}>←</button>
        <span className="header-title">Verify Phone</span>
      </div>

      <div className="scroll" style={{ padding: '36px 24px', flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>📱</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>OTP Sent!</p>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>
          Enter the 6-digit code sent to<br /><strong>{phone}</strong>
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="tel"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: 46, height: 56,
                border: `2px solid ${d ? 'var(--green)' : 'var(--gray-border)'}`,
                borderRadius: 10, textAlign: 'center', fontSize: 24, fontWeight: 700,
                outline: 'none', background: d ? 'var(--green-light)' : 'white',
              }}
            />
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleVerify}
          disabled={loading || digits.join('').length < 6}
        >
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>

        <p style={{ marginTop: 18, color: 'var(--text3)', fontSize: 13 }}>
          Didn't receive it?{' '}
          <a style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}>Resend Code</a>
        </p>
      </div>
    </div>
  );
}
