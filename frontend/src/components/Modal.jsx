import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ show, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  const maxWidth = size === 'lg' ? '700px' : size === 'sm' ? '400px' : '520px';

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1060,
      }}
      onClick={onClose}
    >
      <div
        className="card-custom bg-white shadow-lg border-0 m-3 w-100 animate__animated animate__fadeInUp"
        style={{ maxWidth, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <h5 className="modal-title fw-bold text-dark mb-0">{title}</h5>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-1"
            onClick={onClose}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
