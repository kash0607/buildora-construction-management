import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    manager: 'Kashish Patel',
    budget: '',
    status: 'Planning',
    startDate: '2026-09-15',
    deadline: '2028-03-31',
    description: ''
  });

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name || id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim() || !formData.budget) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createProject(formData, currentUser);
      if (res.success) {
        showToast(`Project "${formData.name}" initialized successfully!`, 'success');
        setFormData({
          name: '',
          client: '',
          location: '',
          manager: currentUser ? currentUser.name : 'Kashish Patel',
          budget: '',
          status: 'Planning',
          startDate: '2026-09-15',
          deadline: '2028-03-31',
          description: ''
        });
        if (onProjectCreated) onProjectCreated(res.data);
        onClose();
      } else {
        showToast(res.message || 'Failed to create project', 'danger');
      }
    } catch {
      showToast('Error creating project', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Construction Project">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="np-name">
              Project Title <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="np-name"
              name="name"
              className="form-control"
              placeholder="e.g. Imperial Heights Phase 2"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="np-client">
                Client / Developer <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="np-client"
                name="client"
                className="form-control"
                placeholder="e.g. Oberoi Realty"
                value={formData.client}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="np-location">
                Site Location <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="np-location"
                name="location"
                className="form-control"
                placeholder="e.g. Bandra West, Mumbai"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label className="form-label" htmlFor="np-manager">
                Project Manager <span className="required-mark">*</span>
              </label>
              <select
                id="np-manager"
                name="manager"
                className="form-control"
                value={formData.manager}
                onChange={handleChange}
                required
              >
                <option value="Kashish Patel">Kashish Patel</option>
                <option value="Vikram Malhotra">Vikram Malhotra</option>
                <option value="Rahul Sharma">Rahul Sharma</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="np-budget">
                Budget (₹ Cr) <span className="required-mark">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                id="np-budget"
                name="budget"
                className="form-control"
                placeholder="15.5"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="np-status">
                Initial Status <span className="required-mark">*</span>
              </label>
              <select
                id="np-status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="np-start-date">
                Start Date <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                id="np-start-date"
                name="startDate"
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="np-deadline">
                Target Completion <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                id="np-deadline"
                name="deadline"
                className="form-control"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="np-desc">
              Project Scope & Description
            </label>
            <textarea
              id="np-desc"
              name="description"
              className="form-control"
              rows={3}
              placeholder="Define project architecture, residential/commercial capacity, structural specifications..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Initializing...' : 'Initialize Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
