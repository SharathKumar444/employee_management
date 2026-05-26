import './ConfirmModal.css'

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-buttons">
          <button
            className="confirm-btn"
            onClick={onConfirm}
          >
            Confirm
          </button>

          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal