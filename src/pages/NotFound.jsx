import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="card"
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '4rem auto'
      }}
    >
      <div className="empty-state-icon" style={{ fontSize: '3rem' }}>
        🏗️
      </div>
      <h2 style={{ marginTop: '1rem' }}>Page Not Found (404)</h2>
      <p className="text-muted" style={{ marginTop: '0.5rem' }}>
        The construction workspace or module you requested does not exist or has been relocated.
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-primary btn-sm">
          Return to Dashboard →
        </Link>
      </div>
    </div>
  );
}
