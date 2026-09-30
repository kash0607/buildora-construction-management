import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuickPOModal({ isOpen, onClose, onPOSubmitted }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    project: '',
    category: 'Structural Steel (TMT Rebars)',
    estimatedValue: '',
    vendor: '',
    priority: 'Normal'
  });

  // Fetch real projects from backend
  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const res = await api.getProjects(currentUser);
          if (res.success && Array.isArray(res.data)) {
            setProjects(res.data);
            if (res.data.length > 0 && !formData.project) {
              setFormData((prev) => ({ ...prev, project: res.data[0].projectId || res.data[0].name }));
            }
          }
        } catch {
          // Projects will remain empty; form will show placeholder
        }
      })();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      showToast('Please select a project', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.createPurchaseRequest(formData, currentUser);
      if (res.success) {
        showToast('Purchase request routed to Finance & PM approval queue.', 'success');
        setFormData({
          project: formData.project,
          category: 'Structural Steel (TMT Rebars)',
          estimatedValue: '',
          vendor: '',
          priority: 'Normal'
        });
        if (onPOSubmitted) onPOSubmitted(res.data);
        onClose();
      }
    } catch {
      showToast('Failed to create purchase request', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Material Purchase Request">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="po-project">
              Project <span className="required-mark">*</span>
            </label>
            <select
              id="po-project"
              name="project"
              className="form-control"
              value={formData.project}
              onChange={handleChange}
              required
            >
              {projects.length === 0 ? (
                <option value="">No projects available</option>
              ) : (
                projects.map((p) => (
                  <option key={p._id || p.projectId} value={p.projectId || p.name}>
                    {p.name} ({p.projectId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="po-category">
                Material Category <span className="required-mark">*</span>
              </label>
              <select
                id="po-category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Structural Steel (TMT Rebars)">Structural Steel (TMT Rebars)</option>
                <option value="Cement & Aggregates">Cement & Aggregates</option>
                <option value="Ready Mix Concrete (RMC)">Ready Mix Concrete (RMC)</option>
                <option value="Plumbing & MEP">Plumbing & MEP</option>
                <option value="Finishing & Tiles">Finishing & Tiles</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="po-value">
                Estimated Value (₹) <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="po-value"
                name="estimatedValue"
                className="form-control"
                placeholder="e.g. ₹15,00,000"
                value={formData.estimatedValue}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="po-vendor">
                Preferred Vendor
              </label>
              <input
                type="text"
                id="po-vendor"
                name="vendor"
                className="form-control"
                placeholder="e.g. UltraTech Cement / Tata Steel"
                value={formData.vendor}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="po-priority">
                Urgency Priority <span className="required-mark">*</span>
              </label>
              <select
                id="po-priority"
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="Normal">Normal (7 Days Lead Time)</option>
                <option value="High">High (3 Days)</option>
                <option value="Critical Path">Critical Path (Immediate)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || projects.length === 0}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
