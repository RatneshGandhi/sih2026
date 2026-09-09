import { create } from 'zustand';
import api from '../api/client';

export const useUIStore = create((set, get) => ({
  notificationsDrawerOpen: false,
  notifications: [],
  unreadCount: 0,
  toast: null,

  setNotificationsDrawerOpen: (open) => set({ notificationsDrawerOpen: open }),

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => {
      set((state) => (state.toast && state.toast.message === message ? { toast: null } : {}));
    }, 4000);
  },

  clearToast: () => set({ toast: null }),

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.notifications || [],
        unreadCount: res.data.unread_count || 0
      });
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    }
  },

  markAsRead: async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === notifId ? { ...n, is_read: true } : n
        );
        const unread = updated.filter((n) => !n.is_read).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (err) {
      console.warn('Failed to mark notification as read:', err.message);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err.message);
    }
  },

  reseedDatabase: async () => {
    try {
      const res = await api.post('/admin/reseed');
      get().showToast('NLAMS database reseeded to clean demo state!', 'success');
      return { success: true, message: res.data.message };
    } catch (err) {
      get().showToast('Failed to reseed database: ' + (err.response?.data?.error || err.message), 'error');
      return { success: false, error: err.message };
    }
  }
}));
