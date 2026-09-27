import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    manager: 'Kashish Patel',
    budget: '',
    progress: 0,
    status: 'Active',
    startDate: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        client: project.client || '',
        location: project.location || '',
        manager: project.manager || 'Kashish Patel',
        budget: project.budget ? (project.budget / 10000000).toFixed(1) : '',
        progress: project.progress || 0,
        status: project.status || 'Active',
        startDate: project.startDate || '',
        deadline: project.deadline || '',
        description: project.description || ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name || id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);
    try {
      const budgetNum = (parseFloat(formData.budget) || 10) * 10000000;
      const progressNum = parseInt(formData.progress, 10) || 0;

      const updatedFields = {
        name: formData.name,
        client: formData.client,
        location: formData.location,
        manager: formData.manager,
        budget: budgetNum,
        progress: progressNum,
        status: formData.status,
        startDate: formData.startDate,
        deadline: formData.deadline,
        description: formData.description
      };

      const res = await api.updateProject(project.id, updatedFields, currentUser);
      if (res.success) {
        showToast(`Project "${formData.name}" updated successfully!`, 'success');
        if (onProjectUpdated) onProjectUpdated(res.data);
        onClose();
      } else {
        showToast(res.message || 'Failed to update project', 'danger');
      }
    } catch {
      showToast('Error updating project', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project Details">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="ep-name">
              Project Name <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="ep-name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="ep-client">
                Client Developer <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="ep-client"
                name="client"
                className="form-control"
                value={formData.client}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ep-location">
                Site Location <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="ep-location"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label className="form-label" htmlFor="ep-manager">
                Project Manager <span className="required-mark">*</span>
              </label>
              <select
                id="ep-manager"
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
              <label className="form-label" htmlFor="ep-budget">
                Budget (₹ Cr) <span className="required-mark">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                id="ep-budget"
                name="budget"
                className="form-control"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ep-progress">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                id="ep-progress"
                name="progress"
                className="form-control"
                value={formData.progress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label className="form-label" htmlFor="ep-status">
                Status <span className="required-mark">*</span>
              </label>
              <select
                id="ep-status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ep-start-date">
                Start Date
              </label>
              <input
                type="date"
                id="ep-start-date"
                name="startDate"
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ep-end-date">
                Target Deadline
              </label>
              <input
                type="date"
                id="ep-end-date"
                name="deadline"
                className="form-control"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ep-desc">
              Scope & Overview
            </label>
            <textarea
              id="ep-desc"
              name="description"
              className="form-control"
              rows={3}
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
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
