# 🎯 Attendance Access Workflow - Complete Test Guide

## ✅ Current Status

- **Backend Server**: Running on `http://127.0.0.1:8000` ✓
- **Frontend Server**: Running on `http://localhost:5175` ✓  
- **Database**: SQLite with 13 test users ✓
- **Company**: COMP001 with 2 admins ✓

---

## 📋 Test Users

### Regular Users (need attendance access)
- **Email**: `sharath222@gmail.com`
- **Password**: `123456+`
- **Status**: Active, No attendance access

### Admins (can approve/reject)
- **Email**: `ay@gmail.com` 
- **Password**: `123456`
- **Email**: `ksharathkumar@gmail.com`
- **Password**: `123456`

---

## 🧪 Manual Testing Steps

### Phase 1: User Request Creation

1. **Open two browser tabs**
   - Tab 1: For regular user (requires attendance access)
   - Tab 2: For admin (to approve)

2. **Tab 1 - Login as regular user**
   ```
   URL: http://localhost:5175
   Email: sharath222@gmail.com
   Password: 123456+
   ```

3. **Tab 1 - Navigate to Attendance Tab**
   - Click "Attendance" in the sidebar
   - Should see message: "Attendance Access Pending"
   - Displays: "Your account is not linked to an employee profile yet..."
   - Shows submission timestamp

4. **Tab 1 - Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Execute: `JSON.parse(localStorage.getItem('attendanceRequests'))`
   - Should show pending request object with:
     ```javascript
     {
       id: 1718XXXXXXXXXX,
       userEmail: "sharath222@gmail.com",
       userName: "sharath222",
       companyId: "COMP001",
       status: "pending",
       createdAt: "2026-06-11T..."
     }
     ```

5. **Tab 1 - Check Notifications in localStorage**
   - Execute: `JSON.parse(localStorage.getItem('notifications'))`
   - Should show admin notifications created locally:
     ```javascript
     {
       id: XXXXXXXXX,
       recipient_user_id: 1,  // or email
       recipient_email: "ay@gmail.com",
       type: "attendance-request",
       requestId: XXXXXXX,
       userName: "sharath222",
       userEmail: "sharath222@gmail.com",
       status: "pending",
       message: "Attendance access requested by sharath222 (sharath222@gmail.com) on 6/11/2026...",
       is_read: false,
       created_at: "2026-06-11T..."
     }
     ```

---

### Phase 2: Admin Approval

6. **Tab 2 - Login as Admin**
   ```
   URL: http://localhost:5175
   Email: ay@gmail.com
   Password: 123456
   ```

7. **Tab 2 - Check Notification Bell**
   - Click the bell icon (🔔) in the navbar
   - Should see attendance request notification:
     - "Attendance access requested by sharath222 (sharath222@gmail.com) on..."
     - Red "Approve" and "Reject" buttons visible

8. **Tab 2 - Click Approve**
   - Click "Approve" button on the notification
   - Notice status updates in the notification dropdown
   - Message changes to "...has been approved by ay@gmail.com"

9. **Tab 2 - Check Updated Notifications**
   - Execute in console: `JSON.parse(localStorage.getItem('notifications'))`
   - Original request notification should have:
     ```
     status: "approved"
     is_read: true
     message: "...has been approved by..."
     ```
   - New user notification should exist:
     ```
     type: "attendance-update"
     status: "approved"
     recipient_email: "sharath222@gmail.com"
     message: "Your attendance request has been approved..."
     ```

10. **Tab 2 - Check Updated Request Status**
    - Execute: `JSON.parse(localStorage.getItem('attendanceRequests'))`
    - Request should have:
      ```
      status: "approved"
      resolvedBy: "ay@gmail.com"
      resolvedAt: "2026-06-11T..."
      ```

---

### Phase 3: User Access Grant

11. **Tab 1 - Refresh Page**
    - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
    - Or wait for automatic 'attendance-access-updated' event listener to trigger

12. **Tab 1 - Check Updated User**
    - Execute: `JSON.parse(localStorage.getItem('currentUser'))`
    - Should now have:
      ```
      attendance_access: true
      attendanceAccess: true
      ```

13. **Tab 1 - Navigate to Attendance**
    - Click Attendance tab again
    - Should now see full attendance dashboard (NOT the pending message)
    - Should display attendance records table

14. **Tab 1 - Check User Notification**
    - Execute: `JSON.parse(localStorage.getItem('notifications'))`
    - Should see approval notification:
      ```
      type: "attendance-update"
      status: "approved"
      message: "Your attendance request has been approved by ay@gmail.com..."
      ```

---

## 🔍 Key Components Tested

### Frontend Components ✓
- `src/pages/Attendance/Attendance.jsx` - Request creation, pending UI
- `src/components/layout/Navbar/Navbar.jsx` - Notification display, approve/reject
- `src/context/AuthContext.jsx` - User state refresh on attendance update
- `src/services/attendanceService.js` - Request/notification CRUD
- `src/services/notificationService.js` - Local + backend notification merge

### Backend APIs ✓
- `POST /auth/login` - User authentication
- `GET /members` - Company members lookup
- `GET /notifications` - Notification retrieval
- User model with `attendance_access` field

### Data Flow ✓
1. User accesses Attendance → `createAttendanceRequest()` called
2. Fetches company admins via `getMembers()` 
3. Creates local attendance request + admin notifications
4. Dispatches `notification-update` event
5. Admin sees notification in bell dropdown
6. Admin clicks Approve → `approveAttendanceRequest()` called
7. Updates user access + creates update notification
8. Dispatches `attendance-access-updated` event
9. User's AuthContext refreshes + attendance_access becomes true
10. Attendance page now shows full dashboard

---

## 🎪 Test Rejection Flow

**Optional**: Repeat steps 1-8 but click "Reject" instead:

- Request status becomes "rejected"
- User gets notification: "Your attendance request has been rejected..."
- User's attendance_access remains false
- User sees pending message if they revisit Attendance tab

---

## 🐛 Troubleshooting

### Admin doesn't see notification
- Check DevTools Console for errors
- Verify `getMembers()` returns admins with correct company_id
- Confirm notification event dispatcher fired: `window.dispatchEvent(new Event('notification-update'))`

### Approval doesn't update user access
- Check AuthContext listener for `attendance-access-updated` event
- Verify currentUser updated in localStorage after approval
- Hard refresh page if needed

### Notifications not showing
- Clear localStorage: `localStorage.clear()`
- Check both backend API notifications AND local storage merge
- Verify user/email filtering in notification service

---

## 📊 Expected Behavior Summary

| Step | User Tab | Admin Tab | Storage State |
|------|----------|-----------|---------------|
| Login | ✓ attendance_access=false | ✓ Ready | User stored |
| Click Attendance | Pending screen shown | - | Request created |
| - | - | Notification appears | Admin notified |
| Click Approve | - | Status updated | Request approved |
| Refresh/Auto-update | ✓ Full dashboard | - | Access granted |
| Check Notification | Update notification | Cleared | Synced |

---

## 🚀 Complete Command Reference

```bash
# Backend
cd backend && python run.py
# http://127.0.0.1:8000

# Frontend  
npm run dev
# http://localhost:5175

# Database check
python check_users.py

# Backend test
python test_attendance_workflow.py
```
