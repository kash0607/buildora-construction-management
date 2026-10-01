import React from 'react';
import { useToast } from '../../context/ToastContext';

export default function Footer() {
  const { showToast } = useToast();

  return (
    <footer className="app-footer">
      <div>
        <strong>BUILDORA</strong> — Enterprise Construction Project Operations Platform &copy; 2026.
      </div>
      <div className="flex gap-4">
        <a
          href="#version"
          className="text-muted"
          onClick={(e) => {
            e.preventDefault();
            showToast('Buildora React v1.0.4-enterprise (Stable)', 'info');
          }}
        >
          v1.0.4
        </a>
        <a
          href="#help"
          className="text-muted"
          onClick={(e) => {
            e.preventDefault();
            showToast('Help center documentation available in next build', 'info');
          }}
        >
          Help & Support
        </a>
        <a
          href="#status"
          className="text-muted"
          onClick={(e) => {
            e.preventDefault();
            showToast('System operational. API latency 42ms.', 'success');
          }}
        >
          System Status: Normal
        </a>
      </div>
    </footer>
  );
}
