import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGuestGuard } from '../../context/GuestGuardContext';

const STEPS = ['Your Info', 'ID Verify', 'Selfie'];

export default function RegisterScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, sendOtp } = useAuth();
  const { clearIntent } = useGuestGuard();

  const from   = location.state?.from || '/';
  const action = location.state?.action;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', password: '', location: 'Lilongwe' });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleNext = async () => {
    if (step === 0) {
      setLoading(true);
      await sendOtp('+265' + form.phone.replace(/^0/, ''));
      setLoading(false);
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else {
      setLoading(true);
      const res = await register(form);
      setLoading(false);
      if (res.success) {
        clearIntent();
        navigate(from || '/', { replace: true });
      }
    }
  };

  return (
    <div className="screen screen-white page-fade">
      <div className="header">
        <button className="header-back" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}>←</button>
        <span className="header-title">Create Account</span>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 8px' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= step ? 'var(--green)' : 'var(--gray-border)',
                color: i <= step ? 'white' : 'var(--text3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, marginBottom: 4,
              }}>{i < step ? '✓' : i + 1}</div>
              <span style={{ fontSize: 10, color: i === step ? 'var(--green)' : 'var(--text3)' }}>{s}</span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--green)' : 'var(--gray-border)', margin: '0 6px', marginBottom: 16 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="scroll" style={{ padding: '12px 20px', flex: 1 }}>
        {step === 0 && (
          <>
            <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--green)' }}>
              🆓 Registration is free. Browse products anytime — account needed only to buy or sell.
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="e.g. Chisomo Banda" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="form-input" style={{ width: 90, flexShrink: 0 }}><option>🇲🇼 +265</option></select>
                <input className="form-input" type="tel" placeholder="088 123 4567" value={form.phone} onChange={e => update('phone', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Your District</label>
              <select className="form-input" value={form.location} onChange={e => update('location', e.target.value)}>
                {['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 'Mzimba', 'Salima', 'Dedza', 'Mangochi'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
              Upload your National ID to get the Verified badge and build buyer trust. You can skip this and do it later.
            </p>
            <div style={{ background: 'var(--gray-light)', border: '2px dashed var(--gray-border)', borderRadius: 12, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 10, gap: 6 }}>
              <span style={{ fontSize: 32 }}>🪪</span>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Tap to upload National ID (front)</p>
            </div>
            <div style={{ background: 'var(--gray-light)', border: '2px dashed var(--gray-border)', borderRadius: 12, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6 }}>
              <span style={{ fontSize: 32 }}>🪪</span>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Tap to upload National ID (back)</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
              Take a selfie to confirm your identity. You can skip and do this from your profile later.
            </p>
            <div style={{ background: 'var(--gray-light)', border: '2px dashed var(--gray-border)', borderRadius: 12, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8 }}>
              <span style={{ fontSize: 40 }}>🤳</span>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Tap to take a selfie</p>
            </div>
          </>
        )}

        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleNext} disabled={loading}>
          {loading ? 'Please wait…' : step < 2 ? 'Continue →' : 'Create My Account'}
        </button>

        {step > 0 && (
          <button className="btn btn-gray" style={{ marginTop: 10 }} onClick={handleNext}>
            Skip for now
          </button>
        )}

        {step === 0 && (
          <>
            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
              Already have an account?{' '}
              <Link to="/login" state={{ from, action }} style={{ color: 'var(--green)', fontWeight: 600 }}>Log In</Link>
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{ width: '100%', marginTop: 12, padding: '11px', background: 'var(--gray-light)', border: '1px solid var(--gray-border)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text3)', cursor: 'pointer' }}
            >
              ← Continue browsing without an account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
