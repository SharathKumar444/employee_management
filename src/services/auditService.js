import axios from "axios"

const API_URL = "http://127.0.0.1:8000"
const LOCAL_AUDIT_KEY = 'auditLogs'

const getLocalAuditLogs = () =>
  JSON.parse(localStorage.getItem(LOCAL_AUDIT_KEY)) || []

const saveLocalAuditLogs = logs =>
  localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(logs))

export const logLocalAuditEvent = event => {
  if (!event) return null

  const localLogs = getLocalAuditLogs()
  const duplicate = localLogs.some(
    log =>
      log.type === event.type &&
      log.userEmail === event.userEmail &&
      log.details === event.details
  )

  if (duplicate) {
    return null
  }

  const entry = {
    id: `local-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...event,
  }

  saveLocalAuditLogs([entry, ...localLogs])
  return entry
}

// =========================
// AXIOS INSTANCE
// =========================
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // increased from 8s
})

// =========================
// FETCH ALL AUDIT LOGS
// =========================
export const fetchAuditLogs = async (companyId) => {
  try {
    if (!companyId) {
      console.warn("⚠️ fetchAuditLogs missing companyId")
      return []
    }

    console.log("📡 Fetching audit logs for companyId", companyId)

    const response = await api.get("/audit-logs", {
      params: {
        company_id: companyId,
      },
    })

    console.log("✅ Audit Logs Response:", response.data)

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.data)
    ) {
      const remoteLogs = response.data.data
      const localLogs = getLocalAuditLogs()

      return [
        ...remoteLogs,
        ...localLogs.filter(
          localLog =>
            !remoteLogs.some(
              remoteLog => remoteLog.id === localLog.id
            )
        ),
      ]
    }

    return getLocalAuditLogs()
  } catch (error) {
    console.error("❌ fetchAuditLogs error:", error)

    if (error.code === "ECONNABORTED") {
      console.error("⏱ Request timed out")
    }

    if (error.response) {
      console.error(
        "Backend Error:",
        error.response.status,
        error.response.data
      )
    }

    return []
  }
}

// =========================
// FETCH COMPANY AUDIT LOGS
// (optional future endpoint)
// GET /audit-logs/{company_id}
// =========================
export const fetchCompanyAuditLogs = async (companyId) => {
  try {
    if (!companyId) {
      console.warn("⚠ companyId missing")
      return []
    }

    const response = await api.get("/audit-logs", {
      params: {
        company_id: companyId,
      },
    })

    if (
      response.data?.success &&
      Array.isArray(response.data?.data)
    ) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error(
      "❌ fetchCompanyAuditLogs error:",
      error
    )

    return []
  }
}