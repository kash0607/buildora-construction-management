import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import { formatDate } from '../utils/formatters';

export default function Notifications() {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      showToast('Error loading notifications', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    const res = await api.markNotificationRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await api.markAllNotificationsRead();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    }
  };

  return (
    <div className="notifications-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title="Notifications & Alerts Center"
        subtitle="Real-time operational alerts for purchase orders, inventory shortages, site inspections, and approvals."
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Notifications' }]}
        badge={
          unreadCount > 0 ? (
            <span
              style={{
                backgroundColor: 'var(--color-danger)',
                color: 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {unreadCount} Unread
            </span>
          ) : null
        }
        actions={
          unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </button>
          )
        }
      />

      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
        {loading ? (
          <LoadingState message="Checking for site alerts..." rows={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="All Caught Up"
            message="You have no notifications or urgent alerts requiring attention at this moment."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: n.read ? 'var(--color-white)' : 'var(--color-warm-sand)',
                  transition: 'background-color 150ms ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: n.read ? 'transparent' : 'var(--color-primary-brown)',
                      marginTop: '6px',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>
                      {n.title}
                    </div>
                    <div style={{ color: 'var(--color-text-body)', fontSize: '0.88rem', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('en-GB') : 'Just now'} • {n.type}
                    </div>
                  </div>
                </div>

                {!n.read && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => handleMarkRead(n._id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
