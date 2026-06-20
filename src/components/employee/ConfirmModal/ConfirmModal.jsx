import './ConfirmModal.css'

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClassName = '',
}) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h2>{title}</h2>

        <p>{message}</p>

        {children}

        <div className="confirm-modal-buttons">
          <button
            className={`confirm-btn ${confirmClassName}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>

          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal