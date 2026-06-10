import axios from "axios"

const API_URL = "http://127.0.0.1:8000"

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
export const fetchAuditLogs = async () => {
  try {
    console.log("📡 Fetching audit logs...")

    const response = await api.get("/audit-logs")

    console.log("✅ Audit Logs Response:", response.data)

    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data
    }

    return []
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

    const response = await api.get(
      `/audit-logs/${companyId}`
    )

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