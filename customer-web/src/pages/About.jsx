import React from 'react';

export default function About() {
  return (
    <>
      <div className="info-hero">
        <div className="container">
          <h1>About Savory Spoon</h1>
        </div>
      </div>
      <section>
        <div className="container" style={{ maxWidth: 720 }}>
          <p style={{ marginBottom: 18, fontSize: 15.5, color: 'var(--ink)' }}>
            Savory Spoon started as a small family kitchen with one goal: serve honest,
            comforting food without the wait. Today we combine that same recipe book with
            a simple online ordering system, so you can skip the line and get straight to
            the good part.
          </p>
          <p style={{ marginBottom: 18, fontSize: 15.5, color: 'var(--ink)' }}>
            Every order placed online goes straight to our kitchen display, so our staff can
            start preparing it the moment it comes in. You can track its status — pending,
            preparing, ready, or completed — right from your account.
          </p>
          <p style={{ fontSize: 15.5, color: 'var(--ink)' }}>
            Whether you're a regular or trying us for the first time, thank you for
            choosing Savory Spoon.
          </p>
        </div>
      </section>
    </>
  );
}
