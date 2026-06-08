import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const LEVELS = [
  { key: 'basic',    icon: '📱', label: 'Basic',      desc: 'Phone number confirmed',             done: true  },
  { key: 'verified', icon: '🪪', label: 'Verified ✓', desc: 'National ID + selfie reviewed',      done: false },
  { key: 'trusted',  icon: '⭐', label: 'Trusted',    desc: '10+ successful transactions',        done: false },
]

export default function IdVerifyScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(0) // 0 = ID, 1 = selfie
  const [error, setError]     = useState('')

  const [idFront,     setIdFront]     = useState(null)
  const [idFrontPrev, setIdFrontPrev] = useState(null)
  const [idBack,      setIdBack]      = useState(null)
  const [idBackPrev,  setIdBackPrev]  = useState(null)
  const [selfie,      setSelfie]      = useState(null)
  const [selfiePrev,  setSelfiePrev]  = useState(null)

  const idFrontRef = useRef()
  const idBackRef  = useRef()
  const selfieRef  = useRef()

  const handleFile = (e, setFile, setPreview) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setError('')
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmitId = async () => {
    if (!idFront) { setError('Please upload your National ID front photo'); return }
    setLoading(true)
    setError('')
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      toast.success('National ID submitted for review')
      setStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSelfie = async () => {
    if (!selfie) { setError('Please take or upload a selfie'); return }
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('malonda_token')
      const fd = new FormData()
      fd.append('selfie', selfie)
      const res = await fetch(`${API_URL}/verify/selfie`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      toast.success('Selfie submitted! We will review within 24 hours ✓')
      navigate(-1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen screen-white page-fade">
      <div className="header">
        <button className="header-back" onClick={() => step > 0 ? setStep(0) : navigate(-1)}>←</button>
        <span className="header-title">ID Verification</span>
      </div>

      <div className="scroll" style={{ padding:20, paddingBottom:80 }}>
        {/* Verification levels */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🛡️</div>
          <p style={{ fontSize:16, fontWeight:700 }}>Become a Verified Seller</p>
          <p style={{ color:'var(--text3)', fontSize:13 }}>Upload your National ID to unlock the Verified badge</p>
        </div>

        {LEVELS.map((l, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:14, border:`1.5px solid ${l.done ? 'var(--green)' : i === (step === 0 ? 1 : 2) - (step === 0 ? 0 : 0) ? 'var(--blue)' : 'var(--gray-border)'}`, borderRadius:12, marginBottom:10, background: l.done ? 'var(--green-light)' : 'white' }}>
            <span style={{ fontSize:22 }}>{l.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600, fontSize:14 }}>{l.label}</p>
              <p style={{ fontSize:12, color:'var(--text3)' }}>{l.desc}</p>
            </div>
            {l.done
              ? <span style={{ color:'var(--green)', fontSize:20 }}>✓</span>
              : <span style={{ color:'var(--text3)' }}>›</span>
            }
          </div>
        ))}

        {error && (
          <div style={{ background:'var(--red-light)', border:'1px solid #e8b4b4', borderRadius:10, padding:'10px 13px', fontSize:13, color:'var(--red)', marginBottom:14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Hidden inputs */}
        <input ref={idFrontRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }}
          onChange={e => handleFile(e, setIdFront, setIdFrontPrev)} />
        <input ref={idBackRef}  type="file" accept="image/*" capture="environment" style={{ display:'none' }}
          onChange={e => handleFile(e, setIdBack,  setIdBackPrev)} />
        <input ref={selfieRef}  type="file" accept="image/*" capture="user"        style={{ display:'none' }}
          onChange={e => handleFile(e, setSelfie,  setSelfiePrev)} />

        {step === 0 && (
          <>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>National ID — Front *</label>
              <div onClick={() => idFrontRef.current.click()}
                style={{ background: idFrontPrev ? 'transparent' : 'var(--gray-light)', border:'2px dashed var(--gray-border)', borderRadius:12, height: idFrontPrev ? 'auto' : 120, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', gap:6 }}>
                {idFrontPrev
                  ? <img src={idFrontPrev} alt="ID Front" style={{ width:'100%', maxHeight:180, objectFit:'cover', borderRadius:10 }} />
                  : <>
                      <span style={{ fontSize:34 }}>🪪</span>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>Tap to take photo or choose from gallery</p>
                      <p style={{ fontSize:11, color:'var(--text3)', opacity:.7 }}>JPG, PNG — max 5MB</p>
                    </>
                }
              </div>
              {idFrontPrev && (
                <button onClick={() => idFrontRef.current.click()} style={{ marginTop:6, fontSize:12, color:'var(--green)', background:'none', border:'none', cursor:'pointer', padding:0 }}>📷 Retake photo</button>
              )}
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>National ID — Back <span style={{ fontWeight:400, color:'var(--text3)' }}>(optional)</span></label>
              <div onClick={() => idBackRef.current.click()}
                style={{ background: idBackPrev ? 'transparent' : 'var(--gray-light)', border:'2px dashed var(--gray-border)', borderRadius:12, height: idBackPrev ? 'auto' : 100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', gap:6 }}>
                {idBackPrev
                  ? <img src={idBackPrev} alt="ID Back" style={{ width:'100%', maxHeight:150, objectFit:'cover', borderRadius:10 }} />
                  : <>
                      <span style={{ fontSize:28 }}>🪪</span>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>Tap to upload ID back</p>
                    </>
                }
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSubmitId} disabled={loading}>
              {loading ? 'Uploading…' : 'Submit National ID →'}
            </button>
            <button className="btn btn-gray" style={{ marginTop:10 }} onClick={() => setStep(1)}>
              Skip ID — go to selfie
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Selfie Photo *</label>
              <div onClick={() => selfieRef.current.click()}
                style={{ background: selfiePrev ? 'transparent' : 'var(--gray-light)', border:'2px dashed var(--gray-border)', borderRadius:12, height: selfiePrev ? 'auto' : 200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', gap:8 }}>
                {selfiePrev
                  ? <img src={selfiePrev} alt="Selfie" style={{ width:'100%', maxHeight:260, objectFit:'cover', borderRadius:10 }} />
                  : <>
                      <span style={{ fontSize:42 }}>🤳</span>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>Tap to take a selfie</p>
                      <p style={{ fontSize:11, color:'var(--text3)', opacity:.7 }}>Use front-facing camera — face must be visible</p>
                    </>
                }
              </div>
              {selfiePrev && (
                <button onClick={() => selfieRef.current.click()} style={{ marginTop:6, fontSize:12, color:'var(--green)', background:'none', border:'none', cursor:'pointer', padding:0 }}>📷 Retake selfie</button>
              )}
            </div>

            <div style={{ background:'var(--blue-light)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'var(--blue)', lineHeight:1.6, marginBottom:16 }}>
              🔒 Your photos are encrypted and only reviewed by our verification team. We never share them.
            </div>

            <button className="btn btn-primary" onClick={handleSubmitSelfie} disabled={loading}>
              {loading ? 'Uploading…' : 'Submit for Review'}
            </button>
            <button className="btn btn-gray" style={{ marginTop:10 }} onClick={() => navigate(-1)}>
              Skip — do this later
            </button>
          </>
        )}
      </div>
    </div>
  )
}
