import React, { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // This is a static contact form for the assignment demo — no backend endpoint yet.
    setSent(true);
  }

  return (
    <>
      <div className="info-hero">
        <div className="container">
          <h1>Contact Us</h1>
        </div>
      </div>
      <section>
        <div className="container contact-grid">
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Visit or reach out</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, marginBottom: 10 }}>
              123 Market Street, Downtown
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, marginBottom: 10 }}>
              Open daily · 10:00 AM – 10:00 PM
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, marginBottom: 10 }}>
              +1 (555) 123-4567
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>
              hello@savoryspoon.example
            </p>
          </div>

          <div className="card">
            {sent ? (
              <div className="form-success">Thanks for reaching out — we'll get back to you soon.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={4} required placeholder="How can we help?" />
                </div>
                <button className="submit-btn" type="submit">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
