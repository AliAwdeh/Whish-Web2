import { API_BASE_URL } from "./config";

function getAuthToken() {
  return localStorage.getItem("token");
}

async function request(method, path, data = null, auth = true) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (err) {
    throw { message: "Network error", detail: err?.message || err };
  }

  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch (_) {}
    throw { status: res.status, ...errBody };
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {

  register: (payload) => request("POST", "/auth/register", payload, false),
  login: (payload) => request("POST", "/auth/login", payload, false),
  logout: () => request("POST", "/auth/logout"),
  me: () => request("GET", "/auth/me"),

  list: (path) => request("GET", path),
  get: (path, id) => request("GET", `${path}/${id}`),
  create: (path, data) => request("POST", path, data),
  update: (path, id, data) => request("PUT", `${path}/${id}`, data),
  remove: (path, id) => request("DELETE", `${path}/${id}`),

  listUsers: () => request("GET", "/users"),
  createUser: (data) => request("POST", "/users", data),
  updateUser: (id, data) => request("PUT", `/users/${id}`, data),
  deleteUser: (id) => request("DELETE", `/users/${id}`),

  listAgents: () => request("GET", "/agents"),
  createAgent: (data) => request("POST", "/agents", data),
  updateAgent: (id, data) => request("PUT", `/agents/${id}`, data),
  deleteAgent: (id) => request("DELETE", `/agents/${id}`),
  agentTransfers: () => request("GET", "/agent/transfers"),
  agentCashIn: (id) => request("POST", `/agent/transfers/${id}/cash-in`),
  agentCashOut: (id) => request("POST", `/agent/transfers/${id}/cash-out`),

  listPaymentMethods: () => request("GET", "/payment-methods"),
  createPaymentMethod: (data) => request("POST", "/payment-methods", data),
  verifyPaymentMethod: (id, data) => request("PATCH", `/payment-methods/${id}`, data),

  listBeneficiaries: () => request("GET", "/beneficiaries"),
  createBeneficiary: (data) => request("POST", "/beneficiaries", data),

  listCurrencies: () => request("GET", "/currencies"),
  createCurrency: (data) => request("POST", "/currencies", data),

  listExchangeRates: () => request("GET", "/exchange-rates"),
  createExchangeRate: (data) => request("POST", "/exchange-rates", data),

  listFeeStructures: () => request("GET", "/fee-structures"),
  createFeeStructure: (data) => request("POST", "/fee-structures", data),

  listOffers: () => request("GET", "/offers"),
  createOffer: (data) => request("POST", "/offers", data),

  listTransfers: () => request("GET", "/transfers"),
  createTransfer: (data) => request("POST", "/transfers", data),
  cancelTransfer: (id) => request("POST", `/transfers/${id}/cancel`),
  refundTransfer: (id) => request("POST", `/transfers/${id}/refund`),
  disputeTransfer: (id, data) => request("POST", `/transfers/${id}/dispute`, data),

  listStatusLogs: () => request("GET", "/transfer-status-logs"),

  listReviews: () => request("GET", "/reviews"),
  createReview: (data) => request("POST", "/reviews", data),

  listDisputes: () => request("GET", "/disputes"),
  createDispute: (data) => request("POST", "/disputes", data),

  listAgentCommissions: () => request("GET", "/agent-commissions"),

  listNotifications: () => request("GET", "/notifications"),

  getTransferOptions: (params) =>
    request(
      "GET",
      `/transfer-options?${new URLSearchParams(params).toString()}`
    ),

  adminSummary: () => request("GET", "/admin/reports/summary"),
};

export function normalizeListResponse(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}
