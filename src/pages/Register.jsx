import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    role: 'Project Manager',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid work email required.';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        showToast('Account registered successfully! Welcome to Buildora.', 'success');
        navigate('/dashboard');
      } else {
        showToast(res.message || 'Registration failed', 'danger');
      }
    } catch {
      showToast('Error creating profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side: Architectural Hero */}
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
            <span>★</span> Join 100+ Enterprise Builders
          </div>
          <h1 className="auth-hero-title">
            Streamline your entire construction lifecycle.
          </h1>
          <p className="auth-hero-desc">
            Equip project managers, site supervisors, procurement officers, and finance teams with real-time field data and budget accountability.
          </p>

          <div className="auth-hero-stats">
            <div>
              <div className="hero-stat-num">35%</div>
              <div className="hero-stat-label">Faster Procurement Cycles</div>
            </div>
            <div>
              <div className="hero-stat-num">Zero</div>
              <div className="hero-stat-label">Budget Leakage</div>
            </div>
            <div>
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-label">Audit Compliance</div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <span>© 2026 Buildora Technologies Ltd.</span>
          <span>Enterprise Grade Security</span>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: '520px' }}>
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-subtitle">Set up your enterprise profile on Buildora</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-fullname">
                  Full Name <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="reg-fullname"
                  name="fullName"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Kashish Patel"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">
                  Primary Role <span className="required-mark">*</span>
                </label>
                <select
                  id="reg-role"
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Site Supervisor">Site Supervisor</option>
                  <option value="Procurement Manager">Procurement Manager</option>
                  <option value="Finance">Finance</option>
                  <option value="Client">Client Representative</option>
                  <option value="Vendor">Vendor / Contractor</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Work Email <span className="required-mark">*</span>
                </label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="reg-phone"
                  name="phone"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password <span className="required-mark">*</span>
                </label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">
                  Confirm Password <span className="required-mark">*</span>
                </label>
                <input
                  type="password"
                  id="reg-confirm-password"
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="reg-terms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="hidden-input"
                />
                <span className="checkbox-custom">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span style={{ fontSize: '0.82rem' }}>
                  I agree to the <a href="#terms" className="text-primary font-semibold">Terms of Service</a> & <a href="#privacy" className="text-primary font-semibold">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Create Enterprise Account'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
