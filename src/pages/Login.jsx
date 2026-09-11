import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('kashish.pm@buildora.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let valid = true;

    if (!email || !email.includes('@')) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!password) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }

    if (!valid) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Login successful! Welcome to BUILDORA.', 'success');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        showToast(res.message || 'Authentication failed', 'danger');
      }
    } catch {
      showToast('Error during authentication', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = async (demoEmail, role) => {
    setEmail(demoEmail);
    setPassword('password123');
    setEmailError(false);
    setPasswordError(false);
    showToast(`Selected ${role} credentials. Signing in...`, 'info', 1500);

    setLoading(true);
    setTimeout(async () => {
      const res = await login(demoEmail, 'password123', role);
      if (res.success) {
        showToast('Signed in successfully!', 'success');
        navigate('/dashboard', { replace: true });
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-page">
      {/* Left Side: Architectural Construction Hero */}
      <div className="auth-hero-side">
        <div className="auth-hero-brand">
          <div className="brand-icon">B</div>
          <div className="brand-text">
            <span
              className="brand-name"
              style={{
                color: 'var(--color-white)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem'
              }}
            >
              BUILDORA
            </span>
            <span
              className="brand-tagline"
              style={{
                color: 'var(--color-warm-beige)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em'
              }}
            >
              Enterprise Operations
            </span>
          </div>
        </div>

        <div className="auth-hero-content">
          <div className="auth-hero-badge">
            <span>★</span> Enterprise Construction Suite
          </div>
          <h1 className="auth-hero-title">
            One platform to plan, manage & deliver projects.
          </h1>
          <p className="auth-hero-desc">
            Unify your engineering, procurement, daily site reports, milestone schedules, and financial cost governance on a single reliable foundation.
          </p>

          <div className="auth-hero-stats">
            <div>
              <div className="hero-stat-num">₹48 Cr+</div>
              <div className="hero-stat-label">Active Project Portfolio</div>
            </div>
            <div>
              <div className="hero-stat-num">12 Sites</div>
              <div className="hero-stat-label">Real-time Telemetry</div>
            </div>
            <div>
              <div className="hero-stat-num">99.4%</div>
              <div className="hero-stat-label">On-time Milestone Rate</div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <span>© 2026 Buildora Technologies Ltd.</span>
          <span>ISO 9001 & 27001 Certified</span>
        </div>
      </div>

      {/* Right Side: Sign-in Form Card */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Welcome Back</h2>
            <p className="auth-card-subtitle">Sign in to your project operations workspace</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Corporate Email <span className="required-mark">*</span>
              </label>
              <div className="input-icon-wrapper">
                <svg className="input-leading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input
                  type="email"
                  id="login-email"
                  className={`form-control ${emailError ? 'is-invalid' : ''}`}
                  placeholder="name@buildora.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(false);
                  }}
                  required
                />
              </div>
              {emailError && <div className="invalid-feedback">Please enter a valid email address.</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password <span className="required-mark">*</span>
                <a
                  href="#forgot"
                  className="text-accent"
                  style={{ fontSize: '0.78rem', fontWeight: 500 }}
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Demo password reset link sent to registered email', 'info');
                  }}
                >
                  Forgot?
                </a>
              </label>
              <div className="input-icon-wrapper">
                <svg className="input-leading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(false);
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Toggle password visibility"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              {passwordError && <div className="invalid-feedback">Password is required.</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden-input"
                />
                <span className="checkbox-custom">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Don't have an enterprise account?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Register Organization
            </Link>
          </div>

          {/* Quick Demo Persona Switcher Bar */}
          <div className="demo-accounts-box">
            <div className="demo-accounts-header">
              <span>Quick Demo Logins</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-accent)' }}>1-Click Sign In</span>
            </div>
            <div className="demo-pills">
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickFill('kashish.pm@buildora.com', 'Project Manager')}
              >
                🏗️ Project Manager
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickFill('admin@buildora.com', 'Admin')}
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickFill('sanjay.site@buildora.com', 'Site Supervisor')}
              >
                👷 Site Supervisor
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickFill('finance@buildora.com', 'Finance')}
              >
                💼 Finance
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickFill('client.rep@lodha.com', 'Client')}
              >
                🏢 Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
