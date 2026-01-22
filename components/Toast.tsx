import React, { useEffect } from 'react';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white shadow-green-500/20';
      case 'error':
        return 'bg-red-500 text-white shadow-red-500/20';
      default:
        return 'bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <div className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-slide-in-right font-medium text-sm ${getStyles()}`}>
      <Icon name={getIcon()} size={20} />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
};