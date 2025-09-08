import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CommunityPage from "./community.jsx";
import "./App.css";

function MainApp() {
  const [form, setForm] = useState({
    name: "",
    college: "",
    email: "",
    category: "Academic",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const errs = [];
    if (!form.name.trim()) errs.push("Name is required");
    if (!form.college.trim()) errs.push("College is required");
    if (!form.details.trim()) errs.push("Please describe the problem");
    if (form.details.length > 1000) errs.push("Problem details are too long (max 1000 chars)");
    return errs;
  }

  function randomId() {
    const ts = Date.now().toString(36).slice(-5);
    const r = Math.random().toString(36).slice(2, 7);
    return `SB-${ts}-${r}`.toUpperCase();
  }

  async function handleSubmit() {
    const errs = validate();
    if (errs.length) {
      setToast({ type: "error", msg: errs.join(" • ") });
      return;
    }
    const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:4000';
    setSubmissionError(null);
    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        college: form.college,
        email: form.email,
        category: form.category,
        details: form.details,
      };
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Submission failed. Please try again.';
        setSubmissionError(msg);
        setToast({ type: 'error', msg });
      } else {
        const report = data.report || { referenceId: randomId(), ...payload };
        setSubmittedReport(report);
        setToast({ type: 'success', msg: `Problem submitted! Reference: ${report.referenceId}` });
        setForm({ name: '', college: '', email: '', category: 'Academic', details: '' });
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'Network error. Could not submit.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4500);
    }
  }

  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <header className="navbar">
          <nav className="nav-content">
            <Link to="/" className="logo">
              <span className="logo-box">SB</span>
              <span>Studentz Bangalore</span>
            </Link>
            <div className="nav-links">
              <Link to="/submit">Submit</Link>
              <Link to="/about">About</Link>
              <Link to="/community">Community</Link>
            </div>
          </nav>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={
            /* Hero Section */
            <section id="home" className="hero">
              <div className="hero-content" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center', 
                maxWidth: '800px', 
                margin: '0 auto',
                gridTemplateColumns: 'none'
              }}>
                <div className="hero-text" style={{ width: '100%' }}>
                  <h1>
                    Speak up. Get help. <span className="highlight">Make change.</span>
                  </h1>
                  <p>
                    Studentz Bangalore is a platform for students to safely share
                    academic, campus, and wellbeing concerns. Submit issues with your
                    name and college, and track them with a reference ID.
                  </p>
                  <div className="hero-buttons" style={{ justifyContent: 'center' }}>
                    <Link to="/submit" className="btn-primary">Submit a Problem</Link>
                    <Link to="/about" className="btn-secondary">Learn More</Link>
                  </div>
                </div>
              </div>
            </section>
          } />
          <Route path="/submit" element={
            /* Submit Form Section */
            <section id="submit" className="section">
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
                  <h2 style={{ textAlign: 'center' }}>Submit your problem</h2>
                  <p style={{ textAlign: 'center' }}>We just need your name, college, and a short description.</p>
                  <div className="form">
                    <div>
                      <label>Full name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g., Ananya Rao"
                      />
                    </div>
                    <div>
                      <label>College *</label>
                      <input
                        name="college"
                        value={form.college}
                        onChange={handleChange}
                        placeholder="e.g., ABC Institute of Technology, Bengaluru"
                      />
                    </div>
                    <div className="form-row">
                      <div>
                        <label>Email (optional)</label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                        />
                      </div>
                      <div>
                        <label>Category</label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                        >
                          <option>Academic</option>
                          <option>Administration</option>
                          <option>Campus Facilities</option>
                          <option>Finance/Fees</option>
                          <option>Wellbeing</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label>Describe the problem *</label>
                      <textarea
                        name="details"
                        maxLength={1000}
                        value={form.details}
                        onChange={handleChange}
                        placeholder="What's going on? Include details like department, dates, etc."
                      />
                      <div className="char-count">{form.details.length}/1000</div>
                    </div>
                    <button type="button" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (<><span className="spinner" />Submitting…</>) : "Submit Problem"}
                    </button>
                    {submissionError && (
                      <div style={{ color: '#fecaca', marginTop: '0.5rem', textAlign: 'center' }}>{submissionError}</div>
                    )}
                    <p className="form-note">
                      Your submission will be processed and you'll receive a reference ID for tracking.
                    </p>
                  </div>
                </div>
              </div>
              {/* Created report preview */}
              {submittedReport && (
                <section className="section">
                  <div className="report-card">
                    <h3>Submission received</h3>
                    <div className="report-meta">
                      <strong>Reference:</strong>
                      <span>{submittedReport.referenceId}</span>
                      <strong>Category:</strong>
                      <span>{submittedReport.category}</span>
                    </div>
                    <div className="report-field"><strong>Name:</strong> {submittedReport.name}</div>
                    <div className="report-field"><strong>College:</strong> {submittedReport.college}</div>
                    {submittedReport.email && <div className="report-field"><strong>Email:</strong> {submittedReport.email}</div>}
                    <div className="report-field"><strong>Details:</strong>
                      <p style={{ marginTop: '0.5rem' }}>{submittedReport.details}</p>
                    </div>
                  </div>
                </section>
              )}
            </section>
          } />
          <Route path="/about" element={
            /* About Section */
            <section id="about" className="section">
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '800px', width: '100%' }}>
                  <h2>About Studentz Bangalore</h2>
                  <p>
                   We are a student-driven community dedicated to helping learners in Bangalore with honest reviews, guidance, and resources.
                  </p>
                  <p>
                    Our mission is to bridge the gap between students and institutions, 
                    creating a transparent channel for constructive feedback and positive change.
                  </p>
                </div>
              </div>
              <footer className="footer">
                © {new Date().getFullYear()} Studentz Bangalore • Built with ❤️
              </footer>
            </section>
          } />
          <Route path="/community" element={<CommunityPage />} />
        </Routes>

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <p>{toast.msg}</p>
          </div>
        )}
      </div>
    </Router>
  );
}

export default MainApp;

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}