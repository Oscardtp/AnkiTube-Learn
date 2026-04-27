"use client";

import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export function NotificationSystem() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map(notification => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

interface NotificationProps {
  notification: {
    id: string;
    type: string;
    message: string;
    dismissible?: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

function Notification({ notification }: NotificationProps) {
  const { removeNotification } = useNotifications();

  const handleDismiss = () => {
    if (notification.dismissible !== false) {
      removeNotification(notification.id);
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-600',
          border: 'border-green-600/20',
          text: 'text-white',
          icon: <CheckCircle className="w-5 h-5" />,
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          border: 'border-red-600/20',
          text: 'text-white',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'loading':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-600/20',
          text: 'text-white',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
      case 'snackbar':
        return {
          bg: 'bg-surface-container-lowest',
          border: 'border-outline-variant/30',
          text: 'text-on-surface',
          icon: null,
        };
      default:
        return {
          bg: 'bg-surface-container-lowest',
          border: 'border-outline-variant/30',
          text: 'text-on-surface',
          icon: null,
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        pointer-events-auto
        transform transition-all duration-300 ease-out
        slide-in-right
        ${styles.bg} ${notification.type === 'snackbar' ? 'border' : ''}
        rounded-xl shadow-2xl shadow-black/10
        overflow-hidden
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {styles.icon && (
          <span className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${styles.text} leading-relaxed`}>
            {notification.message}
          </p>
          {notification.action && (
            <button
              onClick={() => {
                notification.action?.onClick();
                handleDismiss();
              }}
              className={`
                mt-2 text-sm font-medium
                ${notification.type === 'snackbar' 
                  ? 'text-primary hover:text-primary-container' 
                  : 'underline underline-offset-2 opacity-90 hover:opacity-100'
                }
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        {notification.dismissible !== false && (
          <button
            onClick={handleDismiss}
            className={`
              p-1 rounded-full
              hover:bg-white/10 transition-colors
              flex-shrink-0
              ${notification.type === 'snackbar' ? 'text-on-surface-variant' : 'text-white/70'}
            `}
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
