import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService'
import './Notifications.css'

const Notifications = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser) return
      const userId =
        currentUser.id ||
        currentUser._id ||
        currentUser.user_id ||
        null
      const userEmail =
        currentUser.email ||
        currentUser.user_email ||
        null
      const res = await getNotifications(userId, userEmail)
      if (res?.success) {
        setNotifications(res.data)
      }
    }

    loadNotifications()
  }, [currentUser])

  const loadNotifications = async () => {
    if (!currentUser) return
    const userId =
      currentUser.id ||
      currentUser._id ||
      currentUser.user_id ||
      null
    const userEmail =
      currentUser.email ||
      currentUser.user_email ||
      null
    const res = await getNotifications(userId, userEmail)
    if (res?.success) {
      setNotifications(res.data)
    }
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead(currentUser.id, currentUser.email)
    loadNotifications()
  }

  const handleMark = async id => {
    await markNotificationRead(id)
    loadNotifications()
  }

  return (
    <div className="page-container">
      <h2>All Notifications</h2>
      <div style={{ margin: '12px 0' }}>
        <button onClick={handleMarkAll}>Mark all read</button>
      </div>

      {notifications.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => {
            const createdAt =
              n.created_at ||
              n.time ||
              n.timestamp ||
              new Date().toISOString()
            return (
              <div
                key={n.id}
                className={`notification-card ${n.is_read ? 'read' : 'unread'}`}
              >
                <div className="notification-card-row">
                  <div className="notification-card-text">
                    <p>{n.message || n.payload || 'Notification received'}</p>
                    <small>{n.type ? n.type.replace(/[-_]/g, ' ') : 'General'}</small>
                  </div>
                  <div className="notification-card-time">
                    {new Date(createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="notification-card-actions">
                  {!n.is_read && (
                    <button onClick={() => handleMark(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications
