from app.models.notification_model import Notification


def create_notification(db, recipient_user_id: int, type: str, payload: str = None):
    note = Notification(
        recipient_user_id=recipient_user_id,
        type=type,
        payload=payload,
        is_read=False,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
