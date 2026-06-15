import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService'

const Notifications = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])

  const load = async () => {
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
    if (res?.success) setNotifications(res.data)
  }

  useEffect(() => {
    load()
  }, [currentUser?.id])

  const handleMarkAll = async () => {
    await markAllNotificationsRead(currentUser.id, currentUser.email)
    load()
  }

  const handleMark = async id => {
    await markNotificationRead(id)
    load()
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
        <div>
          {notifications.map(n => (
            <div key={n.id} style={{ padding: 12, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>{n.message || n.payload}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 8 }}>
                {!n.is_read && (
                  <button onClick={() => handleMark(n.id)}>Mark read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
