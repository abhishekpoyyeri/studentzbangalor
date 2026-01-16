import React, { useState, useEffect } from "react";

export default function CommunityPage() {
  const [form, setForm] = useState({
    name: "",
    college: "",
    email: "",
    whatsapp: "",
    photo: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [generatedCard, setGeneratedCard] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      // Compress image client-side to reduce upload size
      const MAX_BYTES = 2 * 1024 * 1024; // 2MB target

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          // resize to max 1024 px
          const maxDim = 1024;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Try progressive compression quality values until under MAX_BYTES
          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          const estimateBytes = (b64) => Math.ceil((b64.length * 3) / 4);

          while (estimateBytes(dataUrl.split(',')[1]) > MAX_BYTES && quality > 0.3) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          if (estimateBytes(dataUrl.split(',')[1]) > MAX_BYTES) {
            setToast({ type: 'error', msg: 'Photo is too large even after compression. Try a smaller image.' });
            setTimeout(() => setToast(null), 3500);
            return;
          }

          setPhotoPreview(dataUrl);
          setForm((f) => ({ ...f, photo: dataUrl }));
        };
        img.onerror = () => {
          setToast({ type: 'error', msg: 'Could not read image. Try another file.' });
          setTimeout(() => setToast(null), 3500);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function validate() {
    const errs = [];
    if (!form.name.trim()) errs.push("Name is required");
    if (!form.college.trim()) errs.push("College is required");
    if (!form.email.trim()) errs.push("Email is required");
    if (!form.whatsapp.trim()) errs.push("WhatsApp number is required");
  if (!form.photo) errs.push("Photo is required");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      errs.push("Please enter a valid email");
    }
    
    // WhatsApp number validation (basic)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (form.whatsapp && !phoneRegex.test(form.whatsapp.replace(/\D/g, '').slice(-10))) {
      errs.push("Please enter a valid 10-digit WhatsApp number");
    }
    
    return errs;
  }

  function generateMemberId() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `SB${year}${random}`;
  }

  async function handleSubmit() {
    const errs = validate();
    if (errs.length) {
      setToast({ type: "error", msg: errs.join(" • ") });
      setTimeout(() => setToast(null), 4500);
      return;
    }
    setSubmissionError(null);
    const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:4000';
    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        college: form.college,
        email: form.email,
        whatsapp: form.whatsapp,
        photo: form.photo,
      };

      const res = await fetch(`${API_BASE}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Registration failed. Please try again.';
        setSubmissionError(msg);
        setToast({ type: 'error', msg });
      } else {
        const member = data.member || { memberId: generateMemberId(), ...payload };
        setGeneratedCard({
          memberId: member.memberId,
          name: member.name,
          college: member.college,
          email: member.email,
          whatsapp: member.whatsapp,
          photo: member.photo,
          joinDate: new Date().toLocaleDateString('en-IN'),
          status: member.status || 'Active Member'
        });
        setToast({ type: 'success', msg: `Welcome to the community! Member ID: ${member.memberId}` });
        setForm({ name: '', college: '', email: '', whatsapp: '', photo: null });
        setPhotoPreview(null);
      }
    } catch (err) {
      console.error(err);
      // Network fallback: generate a local member card so user can proceed offline
      const fallbackMember = {
        memberId: generateMemberId(),
        name: form.name,
        college: form.college,
        email: form.email,
        whatsapp: form.whatsapp,
        photo: form.photo,
        status: 'Pending Sync'
      };
      setGeneratedCard({
        ...fallbackMember,
        joinDate: new Date().toLocaleDateString('en-IN')
      });
      saveLocalMember(fallbackMember);
      setToast({ type: 'success', msg: `Saved locally. Member ID: ${fallbackMember.memberId}` });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4500);
    }
  }

  // Local storage helpers so generated cards persist when backend is unavailable
  function saveLocalMember(member) {
    try {
      const key = 'sb_members_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({ ...member, createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      setSavedMembers(existing.slice(0, 50));
    } catch (e) {
      console.error('Could not save local member', e);
    }
  }

  function loadLocalMembers() {
    try {
      const key = 'sb_members_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      setSavedMembers(existing);
    } catch (e) {
      setSavedMembers([]);
    }
  }

  function copyToClipboard(text) {
    try {
      navigator.clipboard?.writeText(text);
      setToast({ type: 'success', msg: 'Copied to clipboard' });
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      console.error('copy failed', e);
    }
  }

  const [savedMembers, setSavedMembers] = useState([]);

  useEffect(() => {
    loadLocalMembers();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #1e3a8a, #1e3a8a, #0f172a)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
  {/* top spacer so main navbar doesn't overlap content */}
  <div style={{ height: '72px' }} />

      {/* Hero Section */}
      <section style={{ padding: '3rem 1rem' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '1rem'
          }}>
            Join Our <span style={{ color: '#93c5fd' }}>Community</span>
          </h1>
          <p style={{
            color: '#bfdbfe',
            fontSize: '1.1rem',
            marginBottom: '2rem'
          }}>
            Become a part of Studentz Bangalore community. Connect with fellow students, 
            share experiences, and help build a better educational ecosystem in Bangalore.
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section style={{ padding: '0 1rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(30, 58, 138, 0.5)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Community Registration</h2>
            <p style={{ textAlign: 'center', color: '#bfdbfe', marginBottom: '2rem' }}>
              Fill in your details to get your community member ID card
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Ananya Rao"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  College Name *
                </label>
                <input
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  placeholder="e.g., ABC Institute of Technology, Bengaluru"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    WhatsApp Number *
                  </label>
                  <input
                    name="whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="9876543210"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Upload Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '0.5rem' }}>
                  Upload a clear photo (max 5MB). JPG, PNG formats supported.
                </p>
                
                {photoPreview && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '1rem',
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '1rem',
                  background: submitting ? 'rgba(59, 130, 246, 0.6)' : '#3b82f6',
                  fontWeight: '600',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {submitting ? "Registering..." : "Register & Generate ID Card"}
              </button>

              {submissionError && (
                <div style={{ color: '#fecaca', textAlign: 'center', fontSize: '0.9rem' }}>
                  {submissionError}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Saved Local Cards (offline fallback) */}
      {savedMembers && savedMembers.length > 0 && (
        <section style={{ padding: '0 1rem 3rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ color: '#93c5fd', marginBottom: '0.75rem' }}>Saved ID Cards (Local)</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {savedMembers.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>{m.college} • {new Date(m.createdAt).toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{m.memberId}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => { setGeneratedCard({ ...m, joinDate: new Date(m.createdAt).toLocaleDateString('en-IN') }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '0.4rem 0.6rem', borderRadius: '0.5rem' }}>View</button>
                    <button onClick={() => copyToClipboard(m.memberId)} style={{ padding: '0.4rem 0.6rem', borderRadius: '0.5rem' }}>Copy ID</button>
                    <button onClick={() => { const key='sb_members_v1'; const list=JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x.memberId!==m.memberId); localStorage.setItem(key, JSON.stringify(list)); setSavedMembers(list); }} style={{ padding: '0.4rem 0.6rem', borderRadius: '0.5rem' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Generated ID Card */}
      {generatedCard && (
        <section style={{ padding: '0 1rem 3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="id-card" style={{
              maxWidth: '450px',
              width: '100%',
              background: 'linear-gradient(135deg, #1e40af, #3730a3)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  STUDENTZ BANGALORE
                </h3>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  COMMUNITY MEMBER ID
                </h2>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  display: 'inline-block'
                }}>
                  {generatedCard.memberId}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginBottom: '0.2rem' }}>NAME</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{generatedCard.name}</div>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginBottom: '0.2rem' }}>COLLEGE</div>
                    <div style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>{generatedCard.college}</div>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginBottom: '0.2rem' }}>CONTACT</div>
                    <div style={{ fontSize: '0.8rem' }}>+91 {generatedCard.whatsapp}</div>
                    <div style={{ fontSize: '0.7rem', color: '#bfdbfe' }}>{generatedCard.email}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={generatedCard.photo} 
                    alt="Member Photo" 
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '1rem',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#86efac',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    ACTIVE
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: '#93c5fd'
              }}>
                <div>JOINED: {generatedCard.joinDate}</div>
                <div>VALID TILL: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getFullYear()}</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              className="no-print"
              onClick={() => window.print()}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📄 Print ID Card
            </button>
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '400px',
          padding: '1rem',
          borderRadius: '1rem',
          textAlign: 'center',
          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.6)',
          background: toast.type === 'success' ? 'rgba(30, 58, 138, 0.9)' : 'rgba(127, 29, 29, 0.9)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(252, 165, 165, 0.3)'}`,
          zIndex: 1000
        }}>
          <p style={{ margin: 0 }}>{toast.msg}</p>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @media print {
            @page { size: auto; margin: 10mm; }
            html, body { height: auto; }
            /* hide everything then reveal only the card */
            body * { visibility: hidden !important; }
            .id-card, .id-card * { visibility: visible !important; }
            .id-card { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              max-width: none !important; 
              margin: 0 auto !important; 
              box-shadow: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* ensure the print button is not printed */
            .no-print { display: none !important; }
          }
        `}
      </style>
    </div>
  );
}