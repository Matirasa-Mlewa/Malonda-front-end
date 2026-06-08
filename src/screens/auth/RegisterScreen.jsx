import React, { useState, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const STEPS = ['Your Info', 'Upload ID', 'Selfie']

export default function RegisterScreen() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'
  const action    = location.state?.action

  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  // Step 0 — form fields
  const [form, setForm] = useState({ name:'', phone:'', password:'', location:'Lilongwe' })

  // Step 1 — ID images
  const [idFront, setIdFront]     = useState(null)
  const [idFrontPrev, setIdFrontPrev] = useState(null)
  const [idBack,  setIdBack]      = useState(null)
  const [idBackPrev,  setIdBackPrev]  = useState(null)

  // Step 2 — Selfie
  const [selfie, setSelfie]       = useState(null)
  const [selfiePrev, setSelfiePrev]   = useState(null)

  // Refs for file inputs
  const idFrontRef = useRef()
  const idBackRef  = useRef()
  const selfieRef  = useRef()

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setError('')
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // Upload image to backend
  const uploadFile = async (file, endpoint, token) => {
    const fd = new FormData()
    const fieldName = endpoint.includes('selfie') ? 'selfie' : endpoint.includes('national-id') ? 'front' : 'front'
    fd.append(fieldName, file)
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Upload failed')
    }
    return res.json()
  }

  const handleNext = async () => {
    setError('')

    if (step === 0) {
      // Validate & register
      if (!form.name || !form.phone || !form.password) { setError('Please fill all fields'); return }
      if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
      setLoading(true)
      try {
        const normalizedPhone = '+265' + form.phone.replace(/^0/, '')
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, phone: normalizedPhone }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Registration failed')
        localStorage.setItem('malonda_token', data.token)
        localStorage.setItem('malonda_user',  JSON.stringify(data.user))
        setStep(1)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }

    } else if (step === 1) {
      // Upload ID (optional — skip if no files)
      if (idFront) {
        setLoading(true)
        try {
          const token = localStorage.getItem('malonda_token')
          const fd = new FormData()
          fd.append('front', idFront)
          if (idBack) fd.append('back', idBack)
          const res = await fetch(`${API_URL}/verify/national-id`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
          if (!res.ok) throw new Error('ID upload failed')
        } catch (err) {
          setError(err.message)
          setLoading(false)
          return
        } finally {
          setLoading(false)
        }
      }
      setStep(2)

    } else {
      // Upload selfie (optional)
      if (selfie) {
        setLoading(true)
        try {
          const token = localStorage.getItem('malonda_token')
          const fd = new FormData()
          fd.append('selfie', selfie)
          const res = await fetch(`${API_URL}/verify/selfie`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
          if (!res.ok) throw new Error('Selfie upload failed')
        } catch (err) {
          setError(err.message)
          setLoading(false)
          return
        } finally {
          setLoading(false)
        }
      }
      // Done — reload auth and navigate
      window.dispatchEvent(new Event('malonda-auth-changed'))
      navigate(from || '/', { replace: true })
    }
  }

  const handleSkip = () => {
    if (step === 2) {
      window.dispatchEvent(new Event('malonda-auth-changed'))
      navigate(from || '/', { replace: true })
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'white', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'var(--green)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>←</button>
        <span style={{ color:'white', fontWeight:600, fontSize:17 }}>Create Account</span>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', padding:'16px 20px 8px' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: i <= step ? 'var(--green)' : 'var(--gray-border)', color: i <= step ? 'white' : 'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, marginBottom:4 }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:10, color: i === step ? 'var(--green)' : 'var(--text3)' }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex:1, height:2, background: i < step ? 'var(--green)' : 'var(--gray-border)', margin:'0 6px', marginBottom:16 }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 20px 100px' }}>
        {error && (
          <div style={{ background:'var(--red-light)', border:'1px solid #e8b4b4', borderRadius:10, padding:'10px 13px', fontSize:13, color:'var(--red)', marginBottom:14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 0: User info ── */}
        {step === 0 && (
          <>
            <div style={{ background:'var(--green-light)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--green)' }}>
              🆓 Registration is free. Browse products anytime without an account.
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="e.g. Chisomo Banda" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ display:'flex', gap:8 }}>
                <select className="form-input" style={{ width:90, flexShrink:0 }}><option>🇲🇼 +265</option></select>
                <input className="form-input" type="tel" placeholder="088 123 4567" value={form.phone} onChange={e => update('phone', e.target.value)} style={{ flex:1 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password (min 8 characters)</label>
              <input className="form-input" type="password" placeholder="Create a strong password" value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Your District</label>
              <select className="form-input" value={form.location} onChange={e => update('location', e.target.value)}>
                {['Lilongwe','Blantyre','Mzuzu','Zomba','Kasungu','Mzimba','Salima','Dedza','Mangochi'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text3)' }}>
              Already have an account?{' '}
              <Link to="/login" state={{ from, action }} style={{ color:'var(--green)', fontWeight:600 }}>Log In</Link>
            </p>
          </>
        )}

        {/* ── Step 1: National ID upload ── */}
        {step === 1 && (
          <>
            <p style={{ fontSize:13, color:'var(--text3)', marginBottom:16, lineHeight:1.6 }}>
              Upload your Malawi National ID to get the <strong>Verified ✓</strong> badge and build buyer trust. This is optional — you can do it later from your profile.
            </p>

            {/* Hidden file inputs */}
            <input ref={idFrontRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }}
              onChange={e => handleFileChange(e, setIdFront, setIdFrontPrev)} />
            <input ref={idBackRef}  type="file" accept="image/*" capture="environment" style={{ display:'none' }}
              onChange={e => handleFileChange(e, setIdBack,  setIdBackPrev)} />

            {/* Front ID */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>National ID — Front</label>
              <div
                onClick={() => idFrontRef.current.click()}
                style={{ background: idFrontPrev ? 'transparent' : 'var(--gray-light)', border:'2px dashed var(--gray-border)', borderRadius:12, height:idFrontPrev ? 'auto' : 110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', gap:6 }}
              >
                {idFrontPrev
                  ? <img src={idFrontPrev} alt="ID Front" style={{ width:'100%', maxHeight:160, objectFit:'cover', borderRadius:10 }} />
                  : <>
                      <span style={{ fontSize:32 }}>🪪</span>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>Tap to take photo or upload</p>
                      <p style={{ fontSize:11, color:'var(--text3)', opacity:.7 }}>JPG, PNG — max 5MB</p>
                    </>
                }
              </div>
              {idFrontPrev && (
                <button onClick={() => idFrontRef.current.click()} style={{ marginTop:6, fontSize:12, color:'var(--green)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  📷 Retake photo
                </button>
              )}
            </div>

            {/* Back ID */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>National ID — Back <span style={{ color:'var(--text3)', fontWeight:400 }}>(optional)</span></label>
              <div
                onClick={() => idBackRef.current.click()}
                style={{ background: idBackPrev ? 'transparent' : 'var(--gray-light)', border:'2px dashed var(--gray-border)', borderRadius:12, height:idBackPrev ? 'auto' : 90, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', gap:6 }}
              >
                {idBackPrev
                  ? <img src={idBackPrev} alt="ID Back" style={{ width:'100%', maxHeight:140, objectFit:'cover', borderRadius:10 }} />
                  : <>
                      <span style={{ fontSize:28 }}>🪪</span>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>Tap to upload ID back</p>
                    </>
                }
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Selfie ── */}
        {step === 2 && (
          <>
            <p style={{ fontSize:13, color:'var(--text3)', marginBottom:16, lineHeight:1.6 }}>
              Take a selfie to confirm your identity matches your National ID. Ensure your face is clearly visible. This is optional — you can do it later.
            </p>

            <input ref={selfieRef} type="file" accept="image/*" capture="user" style={{ display:'none' }}
              onChange={e => handleFileChange(e, setSelfie, setSelfiePrev)} />

            <div
              onClick={() => selfieRef.current.click()}
              style={{ background: selfiePrev ? 'transparent' : 'var(--gray-light)', border:'2px dashed var(--gray-border)', borderRadius:12, height:selfiePrev ? 'auto' : 180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', gap:8, marginBottom:14 }}
            >
              {selfiePrev
                ? <img src={selfiePrev} alt="Selfie" style={{ width:'100%', maxHeight:240, objectFit:'cover', borderRadius:10 }} />
                : <>
                    <span style={{ fontSize:40 }}>🤳</span>
                    <p style={{ fontSize:12, color:'var(--text3)' }}>Tap to take a selfie</p>
                    <p style={{ fontSize:11, color:'var(--text3)', opacity:.7 }}>Use front-facing camera</p>
                  </>
              }
            </div>
            {selfiePrev && (
              <button onClick={() => selfieRef.current.click()} style={{ fontSize:12, color:'var(--green)', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom:14 }}>
                📷 Retake selfie
              </button>
            )}

            <div style={{ background:'var(--blue-light)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'var(--blue)', lineHeight:1.6 }}>
              🔒 Your photos are encrypted and only reviewed by our verification team. We never share them.
            </div>
          </>
        )}

        <button className="btn btn-primary" style={{ marginTop:20 }} onClick={handleNext} disabled={loading}>
          {loading
            ? 'Please wait…'
            : step === 0 ? 'Create Account →'
            : step === 1 ? (idFront ? 'Upload & Continue →' : 'Continue without ID →')
            : (selfie ? 'Submit Selfie & Finish' : 'Finish without selfie')}
        </button>

        {step > 0 && (
          <button className="btn btn-gray" style={{ marginTop:10 }} onClick={handleSkip}>
            Skip for now
          </button>
        )}

        {step === 0 && (
          <button onClick={() => navigate(-1)}
            style={{ width:'100%', marginTop:12, padding:'11px', background:'var(--gray-light)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text3)', cursor:'pointer' }}>
            ← Continue browsing without an account
          </button>
        )}
      </div>
    </div>
  )
}
