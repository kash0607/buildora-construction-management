import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    clientUser: '',
    location: '',
    manager: '',
    managerUser: '',
    budget: '',
    progress: 0,
    status: 'Active',
    startDate: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        try {
          const [pmRes, clientRes] = await Promise.all([
            api.getUsers('Project Manager'),
            api.getUsers('Client'),
          ]);
          if (pmRes.success && pmRes.data) setManagers(pmRes.data);
          if (clientRes.success && clientRes.data) setClients(clientRes.data);
        } catch {
          // ignore
        }
      };
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        client: project.client || '',
        clientUser: project.clientUser || '',
        location: project.location || '',
        manager: project.manager || '',
        managerUser: project.managerUser || '',
        budget: project.budget ? (project.budget / 10000000).toFixed(1) : '',
        progress: project.progress || 0,
        status: project.status || 'Active',
        startDate: project.startDate ? String(project.startDate).split('T')[0] : '',
        deadline: project.deadline ? String(project.deadline).split('T')[0] : '',
        description: project.description || ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const key = name || id;

    if (key === 'managerUser') {
      const selected = managers.find((m) => m._id === value);
      setFormData((prev) => ({
        ...prev,
        managerUser: value,
        manager: selected ? selected.name : prev.manager,
      }));
      return;
    }

    if (key === 'clientUser') {
      const selected = clients.find((c) => c._id === value);
      setFormData((prev) => ({
        ...prev,
        clientUser: value,
        client: selected ? selected.name : prev.client,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: value
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
        clientUser: formData.clientUser || undefined,
        location: formData.location,
        manager: formData.manager,
        managerUser: formData.managerUser || undefined,
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
              {clients.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    id="ep-client-user"
                    name="clientUser"
                    className="form-control"
                    value={formData.clientUser}
                    onChange={handleChange}
                  >
                    <option value="">Select Registered Client</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    id="ep-client"
                    name="client"
                    className="form-control"
                    placeholder="or enter company name"
                    value={formData.client}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <input
                  type="text"
                  id="ep-client"
                  name="client"
                  className="form-control"
                  value={formData.client}
                  onChange={handleChange}
                  required
                />
              )}
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
              {managers.length > 0 ? (
                <select
                  id="ep-manager"
                  name="managerUser"
                  className="form-control"
                  value={formData.managerUser}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Project Manager</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="ep-manager"
                  name="manager"
                  className="form-control"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="Manager Name"
                  required
                />
              )}
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
