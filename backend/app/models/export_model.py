from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.config.database import Base


class ExportHistory(Base):
    """Model to track data exports for audit purposes"""
    __tablename__ = 'export_history'

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, nullable=False, index=True)
    exported_by_id = Column(Integer, nullable=False)  # User ID who exported
    exported_by_email = Column(String(255))  # Email for easier tracking
    data_type = Column(String(50), nullable=False)  # employees, attendance, leaves, audit_logs, notifications, analytics
    export_format = Column(String(20), nullable=False)  # csv, excel, pdf
    record_count = Column(Integer, default=0)  # Number of records exported
    file_name = Column(String(255))  # Name of exported file
    export_reason = Column(Text)  # Optional reason for export
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'company_id': self.company_id,
            'exported_by_id': self.exported_by_id,
            'exported_by_email': self.exported_by_email,
            'data_type': self.data_type,
            'export_format': self.export_format,
            'record_count': self.record_count,
            'file_name': self.file_name,
            'export_reason': self.export_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
