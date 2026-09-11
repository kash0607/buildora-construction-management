import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuickReportModal({ isOpen, onClose, onReportSubmitted }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    project: 'Skyline Heights',
    workersPresent: 142,
    weather: 'Clear, 32°C',
    workCompleted: '',
    issues: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createSiteReport(formData, currentUser);
      if (res.success) {
        showToast('Site report logged and synced to cloud!', 'success');
        setFormData({
          project: 'Skyline Heights',
          workersPresent: 142,
          weather: 'Clear, 32°C',
          workCompleted: '',
          issues: ''
        });
        if (onReportSubmitted) onReportSubmitted(res.data);
        onClose();
      }
    } catch {
      showToast('Failed to submit report', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Daily Site Progress Log">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="qr-project">
              Select Site <span className="required-mark">*</span>
            </label>
            <select
              id="qr-project"
              name="project"
              className="form-control"
              value={formData.project}
              onChange={handleChange}
              required
            >
              <option value="Skyline Heights">Skyline Heights Luxury Towers</option>
              <option value="Metro Commercial Complex">Metro Commercial Complex</option>
              <option value="Green Valley Residency">Green Valley Residency</option>
              <option value="Riverside Villas & Club">Riverside Villas & Club</option>
              <option value="Horizon Tech Park - Tower C">Horizon Tech Park - Tower C</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="qr-workers">
                Workers Present
              </label>
              <input
                type="number"
                id="qr-workers"
                name="workersPresent"
                className="form-control"
                value={formData.workersPresent}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="qr-weather">
                Weather Condition
              </label>
              <input
                type="text"
                id="qr-weather"
                name="weather"
                className="form-control"
                value={formData.weather}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="qr-completed">
              Primary Works Executed Today <span className="required-mark">*</span>
            </label>
            <textarea
              id="qr-completed"
              name="workCompleted"
              className="form-control"
              rows={3}
              placeholder="Describe casting, rebar fixing, MEP rough-in, or finishing works..."
              value={formData.workCompleted}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="qr-issues">
              Site Issues or Safety Observations
            </label>
            <input
              type="text"
              id="qr-issues"
              name="issues"
              className="form-control"
              placeholder="e.g. Minor material shipment delay, zero safety incidents"
              value={formData.issues}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Discard
          </button>
          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Field Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
