import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [clients, setClients] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const targetDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    clientUser: '',
    location: '',
    manager: currentUser?.name || '',
    managerUser: currentUser?._id || '',
    budget: '',
    status: 'Planning',
    startDate: today,
    deadline: targetDate,
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Load real managers and clients
      const loadUsers = async () => {
        try {
          const [pmRes, clientRes] = await Promise.all([
            api.getUsers('Project Manager'),
            api.getUsers('Client'),
          ]);

          if (pmRes.success && pmRes.data?.length > 0) {
            setManagers(pmRes.data);
            if (!formData.managerUser) {
              const matched = pmRes.data.find((m) => m._id === currentUser?._id) || pmRes.data[0];
              setFormData((prev) => ({
                ...prev,
                manager: matched.name,
                managerUser: matched._id,
              }));
            }
          }

          if (clientRes.success && clientRes.data?.length > 0) {
            setClients(clientRes.data);
          }
        } catch {
          // Non-blocking user fetch
        }
      };

      loadUsers();
    }
  }, [isOpen, currentUser]);

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
          clientUser: '',
          location: '',
          manager: currentUser ? currentUser.name : '',
          managerUser: currentUser?._id || '',
          budget: '',
          status: 'Planning',
          startDate: today,
          deadline: targetDate,
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
              {clients.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    id="np-client-user"
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
                    id="np-client"
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
                  id="np-client"
                  name="client"
                  className="form-control"
                  placeholder="e.g. Oberoi Realty"
                  value={formData.client}
                  onChange={handleChange}
                  required
                />
              )}
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
              {managers.length > 0 ? (
                <select
                  id="np-manager"
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
                  id="np-manager"
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
