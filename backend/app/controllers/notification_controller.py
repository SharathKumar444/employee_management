from sqlalchemy.orm import Session
from app.models.notification_model import Notification


def get_notifications(db: Session, user_id: int):
    notes = db.query(Notification).filter(Notification.recipient_user_id == user_id).order_by(Notification.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "recipient_user_id": n.recipient_user_id,
            "type": n.type,
            "payload": n.payload,
            "is_read": n.is_read,
            "created_at": n.created_at,
        }
        for n in notes
    ]


def mark_notification_read(db: Session, notification_id: int):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        return None
    n.is_read = True
    db.commit()
    return {
        "success": True,
        "id": n.id,
    }


def mark_all_read(db: Session, user_id: int):
    notes = db.query(Notification).filter(Notification.recipient_user_id == user_id, Notification.is_read == False).all()
    for n in notes:
        n.is_read = True
    db.commit()
    return {"success": True, "marked": len(notes)}
