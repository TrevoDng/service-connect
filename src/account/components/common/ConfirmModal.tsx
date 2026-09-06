// src/account/components/common/ConfirmModal.tsx
import React from 'react';
//@ts-ignore
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  children?: React.ReactNode; // Add children support
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  children
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'confirm-btn-danger';
      case 'warning':
        return 'confirm-btn-warning';
      default:
        return 'confirm-btn-primary';
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button className="confirm-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
          {children && <div className="confirm-modal-children">{children}</div>}
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={getConfirmButtonClass()} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;