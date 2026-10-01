import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuickReportModal({ isOpen, onClose, onReportSubmitted }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    project: '',
    workersPresent: 50,
    weather: 'Clear, 28°C',
    workCompleted: '',
    issues: ''
  });

  useEffect(() => {
    if (isOpen) {
      const loadProjects = async () => {
        try {
          const res = await api.getProjects();
          if (res.success && res.data?.length > 0) {
            setProjects(res.data);
            if (!formData.project) {
              setFormData((prev) => ({ ...prev, project: res.data[0].name }));
            }
          }
        } catch {
          // ignore
        }
      };
      loadProjects();
    }
  }, [isOpen]);

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
        // If a photo was selected, upload it
        if (photoFile && res.data) {
          try {
            const reportId = res.data.reportId || res.data._id || res.data.id;
            const photoData = new FormData();
            photoData.append('photo', photoFile);
            photoData.append('caption', `Field progress photo for ${formData.project}`);
            await api.uploadSitePhoto(reportId, photoData);
          } catch {
            // non-fatal
          }
        }

        showToast('Site report logged and synced to cloud!', 'success');
        setFormData({
          project: projects[0]?.name || '',
          workersPresent: 50,
          weather: 'Clear, 28°C',
          workCompleted: '',
          issues: ''
        });
        setPhotoFile(null);
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
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.name}>
                  {p.name} ({p.projectId || p.id})
                </option>
              ))}
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

          <div className="form-group">
            <label className="form-label" htmlFor="qr-photo">
              Attach Site Progress Photo (Optional)
            </label>
            <input
              type="file"
              id="qr-photo"
              className="form-control"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
            {photoFile && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.3rem' }}>
                📷 {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
              </div>
            )}
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
