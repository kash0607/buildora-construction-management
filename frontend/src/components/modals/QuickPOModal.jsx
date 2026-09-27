import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuickPOModal({ isOpen, onClose, onPOSubmitted }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    project: 'Skyline Heights',
    category: 'Structural Steel (TMT Rebars)',
    estimatedValue: '₹15,00,000',
    vendor: 'Tata Steel Structurals Ltd.',
    priority: 'Normal'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createPurchaseRequest(formData, currentUser);
      if (res.success) {
        showToast('Purchase request routed to Finance & PM approval queue.', 'success');
        setFormData({
          project: 'Skyline Heights',
          category: 'Structural Steel (TMT Rebars)',
          estimatedValue: '₹15,00,000',
          vendor: 'Tata Steel Structurals Ltd.',
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
              <option value="Skyline Heights">Skyline Heights Luxury Towers</option>
              <option value="Metro Commercial Complex">Metro Commercial Complex</option>
              <option value="Green Valley Residency">Green Valley Residency</option>
              <option value="Riverside Villas & Club">Riverside Villas & Club</option>
              <option value="Horizon Tech Park - Tower C">Horizon Tech Park - Tower C</option>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
