import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationsDrawer from './NotificationsDrawer';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export default function Layout() {
  const { user, token } = useAuthStore();
  const { toast, clearToast, fetchNotifications } = useUIStore();

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30s refresh
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <Header />
      <Sidebar />
      <NotificationsDrawer />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl border bg-white border-govSlate-200 animate-slide-up">
          <span className={`material-symbols-outlined text-[20px] ${
            toast.type === 'success' ? 'text-govEmerald' :
            toast.type === 'error' ? 'text-error' : 'text-primary'
          }`}>
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="text-xs font-semibold text-govSlate-900">{toast.message}</span>
          <button onClick={clearToast} className="p-0.5 hover:bg-govSlate-100 rounded text-govSlate-400">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Main stage with padding for fixed sidebar (64 = 16rem = 256px) and header (16 = 4rem = 64px + 3px strip) */}
      <div className="pl-64 pt-[67px] flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
