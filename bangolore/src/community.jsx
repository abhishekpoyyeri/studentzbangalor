import React, { useState } from "react";

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
      if (file.size > 5 * 1024 * 1024) {
        setToast({ type: "error", msg: "Photo size must be less than 5MB" });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
        setForm((f) => ({ ...f, photo: e.target.result }));
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      errs.push("Please enter a valid email");
    }
    
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
    try {
      setSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const memberId = generateMemberId();
      const joinDate = new Date().toLocaleDateString('en-IN');
      
      const cardData = {
        memberId,
        name: form.name,
        college: form.college,
        email: form.email,
        whatsapp: form.whatsapp,
        photo: form.photo,
        joinDate,
        status: "Active Member"
      };
      
      setGeneratedCard(cardData);
      setToast({ type: 'success', msg: `Welcome to the community! Member ID: ${memberId}` });
      setForm({ name: '', college: '', email: '', whatsapp: '', photo: null });
      setPhotoPreview(null);
      
    } catch (err) {
      setToast({ type: 'error', msg: 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4500);
    }
  }

  return (
    <div className="community-page">
      <section className="community-hero">
        <div className="community-hero-content">
          <h1>Join Our <span className="highlight">Community</span></h1>
          <p>
            Become a part of Studentz Bangalore community. Connect with fellow students, 
            share experiences, and help build a better educational ecosystem in Bangalore.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="form-container">
          <div className="card">
            <h2>Community Registration</h2>
            <p className="subtitle">Fill in your details to get your community member ID card</p>

            <div className="form">
              <div>
                <label>Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Ananya Rao"
                />
              </div>

              <div>
                <label>College Name *</label>
                <input
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  placeholder="e.g., ABC Institute of Technology, Bengaluru"
                />
              </div>

              <div className="form-row">
                <div>
                  <label>Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label>WhatsApp Number *</label>
                  <input
                    name="whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label>Upload Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <p className="form-note">
                  Upload a clear photo (max 5MB). JPG, PNG formats supported.
                </p>
                
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Preview" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <span className="spinner" />}
                {submitting ? "Registering..." : "Register & Generate ID Card"}
              </button>

              {submissionError && (
                <div className="error-message">{submissionError}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {generatedCard && (
        <section className="section">
          <div className="card-container">
            <div className="id-card">
              <div className="id-card-header">
                <h3 className="id-card-label">STUDENTZ BANGALORE</h3>
                <h2 className="id-card-title">COMMUNITY MEMBER ID</h2>
                <div className="id-card-id">{generatedCard.memberId}</div>
              </div>

              <div className="id-card-content">
                <div className="id-card-info">
                  <div className="info-field">
                    <span className="field-label">NAME</span>
                    <span className="field-value">{generatedCard.name}</span>
                  </div>
                  
                  <div className="info-field">
                    <span className="field-label">COLLEGE</span>
                    <span className="field-value">{generatedCard.college}</span>
                  </div>
                  
                  <div className="info-field">
                    <span className="field-label">CONTACT</span>
                    <span className="field-value">+91 {generatedCard.whatsapp}</span>
                    <span className="field-value email">{generatedCard.email}</span>
                  </div>
                </div>

                <div className="id-card-photo">
                  <img src={generatedCard.photo} alt="Member Photo" />
                  <div className="active-badge">ACTIVE</div>
                </div>
              </div>

              <div className="id-card-footer">
                <span>JOINED: {generatedCard.joinDate}</span>
                <span>VALID TILL: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="print-button-container">
            <button className="print-button" onClick={() => window.print()}>
              📄 Print ID Card
            </button>
          </div>
        </section>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <p>{toast.msg}</p>
        </div>
      )}

      <style>
        {`
          .community-page {
            min-height: 100vh;
            background: linear-gradient(to bottom, #1e3a8a, #1e3a8a, #0f172a);
            color: white;
            font-family: Inter, system-ui, sans-serif;
          }

          .community-hero {
            padding: 4rem 1rem 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .community-hero-content {
            max-width: 800px;
            width: 100%;
            text-align: center;
          }

          .community-hero-content h1 {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 1.5rem;
          }

          .community-hero-content .highlight {
            color: #93c5fd;
            background: linear-gradient(135deg, #60a5fa, #93c5fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .community-hero-content p {
            color: #bfdbfe;
            font-size: 1.1rem;
          }

          .form-container {
            display: flex;
            justify-content: center;
            width: 100%;
          }

          .form-container .card {
            max-width: 600px;
            width: 100%;
          }

          .card .subtitle {
            color: #bfdbfe;
            margin-bottom: 2rem;
            text-align: center;
          }

          .photo-preview {
            margin-top: 1.5rem;
            text-align: center;
          }

          .photo-preview img {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.2);
          }

          .error-message {
            color: #fecaca;
            text-align: center;
            font-size: 0.9rem;
            padding: 0.75rem;
            background: rgba(127, 29, 29, 0.2);
            border-radius: 0.75rem;
            border-left: 3px solid #f87171;
          }

          .card-container {
            display: flex;
            justify-content: center;
            width: 100%;
          }

          .id-card {
            max-width: 450px;
            width: 100%;
            background: linear-gradient(135deg, #1e40af, #3730a3);
            border-radius: 1.5rem;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }

          .id-card:hover {
            box-shadow: 0 25px 50px rgba(59, 130, 246, 0.3);
            transform: translateY(-4px);
          }

          .id-card-header {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .id-card-label {
            color: #93c5fd;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
            letter-spacing: 1px;
          }

          .id-card-title {
            font-size: 1.2rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
          }

          .id-card-id {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            font-size: 0.85rem;
            display: inline-block;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .id-card-content {
            display: flex;
            gap: 1.5rem;
            align-items: flex-start;
            margin-bottom: 1.5rem;
          }

          .id-card-info {
            flex: 1;
          }

          .info-field {
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
          }

          .field-label {
            font-size: 0.7rem;
            color: #93c5fd;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 0.2rem;
          }

          .field-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: white;
            line-height: 1.3;
          }

          .field-value.email {
            font-size: 0.8rem;
            color: #bfdbfe;
            font-weight: 400;
            margin-top: 0.1rem;
          }

          .id-card-photo {
            text-align: center;
          }

          .id-card-photo img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 1rem;
            border: 3px solid rgba(255, 255, 255, 0.3);
            margin-bottom: 0.75rem;
            transition: all 0.3s ease;
          }

          .id-card-photo img:hover {
            border-color: rgba(147, 197, 253, 0.6);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          }

          .active-badge {
            background: rgba(34, 197, 94, 0.3);
            color: #86efac;
            padding: 0.3rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.7rem;
            font-weight: 700;
            border: 1px solid rgba(34, 197, 94, 0.5);
            letter-spacing: 0.5px;
          }

          .id-card-footer {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            display: flex;
            justify-content: space-between;
            font-size: 0.7rem;
            color: #93c5fd;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .print-button-container {
            text-align: center;
            margin-top: 2.5rem;
          }

          .print-button {
            padding: 0.875rem 2rem;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1.5px solid rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .print-button:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .print-button:active {
            transform: translateY(0);
          }

          @media (max-width: 640px) {
            .community-hero-content h1 {
              font-size: 2rem;
            }

            .community-hero-content p {
              font-size: 1rem;
            }

            .id-card-content {
              flex-direction: column;
              gap: 1.5rem;
            }

            .id-card-footer {
              flex-direction: column;
              gap: 0.75rem;
              text-align: center;
            }

            .print-button {
              width: 100%;
            }
          }

          @media print {
            body * {
              visibility: hidden;
            }
            .id-card, .id-card * {
              visibility: visible;
            }
            .id-card {
              position: absolute;
              left: 0;
              top: 0;
              page-break-after: avoid;
            }
          }
        `}
      </style>
    </div>
  );
}