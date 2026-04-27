"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'toast' | 'snackbar' | 'error' | 'loading' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'dismissible'>) => void;
  removeNotification: (id: string) => void;
  toast: (message: string, type?: 'success' | 'info' | 'error') => void;
  snackbar: (message: string, action?: { label: string; onClick: () => void }) => void;
  error: (message: string, retryAction?: () => void) => void;
  loading: (message: string, dismissible?: boolean) => void;
  success: (message: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'dismissible'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const dismissible = notification.type !== 'loading';
    
    setNotifications(prev => [...prev, { ...notification, id, dismissible }]);

    // Auto-dismiss para toasts y notificaciones no persistentes
    if (notification.type === 'toast' || notification.type === 'success') {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const toast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    addNotification({
      type: type === 'error' ? 'error' : type === 'success' ? 'success' : 'toast',
      message,
      duration: type === 'error' ? 5000 : 3000,
    });
  }, [addNotification]);

  const snackbar = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'snackbar',
      message,
      action,
      duration: action ? 6000 : 4000,
    });
  }, [addNotification]);

  const error = useCallback((message: string, retryAction?: () => void) => {
    addNotification({
      type: 'error',
      message,
      action: retryAction ? { label: 'Reintentar', onClick: retryAction } : undefined,
      duration: undefined, // No auto-dismiss
    });
  }, [addNotification]);

  const loading = useCallback((message: string, dismissible: boolean = false) => {
    addNotification({
      type: 'loading',
      message,
      dismissible,
    });
  }, [addNotification]);

  const success = useCallback((message: string) => {
    addNotification({
      type: 'success',
      message,
      duration: 3000,
    });
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        toast,
        snackbar,
        error,
        loading,
        success,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
