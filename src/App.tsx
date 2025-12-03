import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { api, normalizeListResponse } from "./api/client";
import { API_BASE_URL } from "./api/config";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { SectionNotice } from "./components/SectionNotice";
import { Toast } from "./components/Toast";
import { roleOptions } from "./lib/options";
import {
  defaultBeneficiaries,
  defaultCurrencies,
  defaultOffers,
  defaultPaymentMethods,
  sampleAgents,
  sampleNotifications,
} from "./lib/seedData";
import { parseError } from "./lib/utils";
import { AdminPanel } from "./sections/AdminPanel";
import { AgentsPanel } from "./sections/AgentsPanel";
import { AuthPanel } from "./sections/AuthPanel";
import { NotificationsPanel } from "./sections/NotificationsPanel";
import { ReportsPanel } from "./sections/ReportsPanel";
import { SupportChatPanel } from "./sections/SupportChatPanel";
import { TransferSearchPanel } from "./sections/TransferSearchPanel";
import { TransfersPanel } from "./sections/TransfersPanel";
import { WalletPanel } from "./sections/WalletPanel";
import { AgentLocatorPanel } from "./sections/AgentLocatorPanel";
import type {
  AdminSummary,
  AgentForm,
  AuthFormState,
  AuthMode,
  BeneficiaryForm,
  ChatMessage,
  Currency,
  CurrencyForm,
  ExchangeRateForm,
  FeeForm,
  Offer,
  OfferForm,
  PaymentMethodForm,
  PayoutMethod,
  StatusMap,
  ToastTone,
  Transfer,
  TransferFormState,
  TransferOptionsResult,
  TransferSearchState,
  TransferSpeed,
  User,
} from "./types";

const authDefaults: AuthFormState = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

const beneficiaryDefaults = (): BeneficiaryForm => ({
  full_name: "",
  country: "",
  city: "",
  payout_method: "bank_deposit",
  payout_details: {},
});

const paymentMethodDefaults = (currencyCode = ""): PaymentMethodForm => ({
  type: "bank_account",
  provider_name: "",
  currency: currencyCode,
  masked_number: "",
  details: {},
});

const currencyDefaults: CurrencyForm = { code: "", name: "", is_active: true };

const exchangeRateDefaults = (fromCurrencyId: number | string = "", toCurrencyId: number | string = ""): ExchangeRateForm => ({
  from_currency_id: fromCurrencyId,
  to_currency_id: toCurrencyId,
  rate: 0,
  valid_from: "",
  valid_to: "",
});

const feeDefaults = (
  fromCurrencyId: number | string = "",
  toCurrencyId: number | string = "",
  payout_method: PayoutMethod = "bank_deposit"
): FeeForm => ({
  from_currency_id: fromCurrencyId,
  to_currency_id: toCurrencyId,
  payout_method,
  base_fee: 0,
  percent_fee: 0,
  is_active: false,
});

const offerDefaults: OfferForm = {
  title: "",
  description: "",
  discount_percent: 0,
  starts_at: "",
  ends_at: "",
  is_active: false,
};

const agentDefaults: AgentForm = {
  store_name: "",
  address: "",
  city: "",
  country: "",
  lat: "",
  long: "",
  working_from: "",
  working_to: "",
};

const transferSearchDefaults: TransferSearchState = {
  from_currency_id: "",
  to_currency_id: "",
  amount_from: 0,
  payout_method: "bank_deposit",
  speed: "instant",
};

const transferDefaults = (
  fromCurrencyId: number | string = "",
  toCurrencyId: number | string = "",
  payout_method: PayoutMethod = "bank_deposit",
  speed: TransferSpeed = "instant"
): TransferFormState => ({
  beneficiary_id: "",
  payment_method_id: "",
  agent_id: "",
  offer_id: "",
  from_currency_id: fromCurrencyId,
  to_currency_id: toCurrencyId,
  amount_from: 0,
  amount_to: 0,
  fee_amount: 0,
  exchange_rate_used: 1,
  speed,
  payout_method,
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthFormState>(authDefaults);

  const [status, setStatus] = useState<StatusMap>({});
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>("positive");

  const [currencies, setCurrencies] = useState<Currency[]>(defaultCurrencies);
  const [beneficiaries, setBeneficiaries] = useState(defaultBeneficiaries);
  const [paymentMethods, setPaymentMethods] = useState(defaultPaymentMethods);
  const [offers, setOffers] = useState<Offer[]>(defaultOffers);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [transferOptions, setTransferOptions] = useState<TransferOptionsResult | null>(null);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [agents, setAgents] = useState(sampleAgents);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Whish support assistant. Ask about transfers, disputes, agents, or fees.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const supportSystemPrompt =
    "You are Whish Support, an expert in cross-border money transfer operations, compliance, disputes, and agent management. Be concise, actionable, and polite. If asked about account-specific data, remind the user you cannot see their private data and guide them to the correct API endpoint.";
  const [notificationsInterval, setNotificationsInterval] = useState<number | null>(null);

  const normalizedRole = (user?.role || "").toString().toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const isAgent = normalizedRole === "agent";
  const isUser = normalizedRole === "user";
  const canCustomerFlows = Boolean(user) && (isUser || isAdmin);
  const canAgentFlows = Boolean(user) && (isAgent || isAdmin);
  const canAdminFlows = Boolean(user) && isAdmin;

  const [transferSearch, setTransferSearch] = useState<TransferSearchState>(transferSearchDefaults);

  const [newTransfer, setNewTransfer] = useState<TransferFormState>(transferDefaults());
  const [newBeneficiary, setNewBeneficiary] = useState<BeneficiaryForm>(beneficiaryDefaults());
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethodForm>(paymentMethodDefaults());
  const [newCurrency, setNewCurrency] = useState<CurrencyForm>(currencyDefaults);
  const [newExchangeRate, setNewExchangeRate] = useState<ExchangeRateForm>(exchangeRateDefaults());
  const [newFee, setNewFee] = useState<FeeForm>(feeDefaults());
  const [newOffer, setNewOffer] = useState<OfferForm>(offerDefaults);
  const [newAgent, setNewAgent] = useState<AgentForm>(agentDefaults);

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    search: false,
    wallet: false,
    transfers: false,
    admin: false,
    agents: false,
    reports: false,
    locator: false,
  });
  const [isChatPage, setIsChatPage] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      bootstrapFromApi();
    }
    return () => {
      if (notificationsInterval) clearInterval(notificationsInterval);
    };
  }, []);

  useEffect(() => {
    if (currencies.length) {
      const primary = currencies[0].id;
      const secondary = currencies[1]?.id ?? primary;
      setTransferSearch((prev) => ({
        ...prev,
        from_currency_id: prev.from_currency_id || primary,
        to_currency_id: prev.to_currency_id || secondary,
      }));
      setNewTransfer((prev) => ({
        ...prev,
        from_currency_id: prev.from_currency_id || primary,
        to_currency_id: prev.to_currency_id || secondary,
      }));
      setNewPaymentMethod((prev) => ({ ...prev, currency: prev.currency || currencies[0].code }));
      setNewExchangeRate((prev) => ({
        ...prev,
        from_currency_id: prev.from_currency_id || primary,
        to_currency_id: prev.to_currency_id || secondary,
      }));
      setNewFee((prev) => ({
        ...prev,
        from_currency_id: prev.from_currency_id || primary,
        to_currency_id: prev.to_currency_id || secondary,
      }));
    }
  }, [currencies]);

  useEffect(() => {
    if (beneficiaries.length) {
      setNewTransfer((prev) => ({ ...prev, beneficiary_id: prev.beneficiary_id || beneficiaries[0].id }));
    }
  }, [beneficiaries]);

  useEffect(() => {
    if (paymentMethods.length) {
      setNewTransfer((prev) => ({ ...prev, payment_method_id: prev.payment_method_id || paymentMethods[0].id }));
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (offers.length) {
      setNewTransfer((prev) => ({ ...prev, offer_id: prev.offer_id || offers[0].id }));
    }
  }, [offers]);

  useEffect(() => {
    if (agents.length) {
      setNewTransfer((prev) => ({ ...prev, agent_id: prev.agent_id || agents[0].id }));
    }
  }, [agents]);

  useEffect(() => {
    const rate = transferOptions?.rate ? Number(transferOptions.rate) : 0;
    const sendAmount = Number(transferSearch.amount_from || 0);
    const baseAmountTo =
      transferOptions?.amount_to !== undefined && transferOptions.amount_to !== null
        ? Number(transferOptions.amount_to)
        : rate > 0 && sendAmount > 0
        ? sendAmount * rate
        : 0;

    const computedFeeFrom =
      transferOptions?.fee?.total !== undefined
        ? Number(transferOptions.fee.total)
        : sendAmount > 0 && rate > 0
        ? Number(sendAmount * (newFee.percent_fee / 100) + newFee.base_fee)
        : 0;

    const feeInRecipient = rate > 0 ? computedFeeFrom * rate : 0;
    const computedAmountTo = Math.max(0, baseAmountTo - feeInRecipient);

    setNewTransfer((prev) => ({
      ...prev,
      from_currency_id: transferSearch.from_currency_id,
      to_currency_id: transferSearch.to_currency_id,
      amount_from: sendAmount,
      amount_to: Number(computedAmountTo.toFixed(2)),
      payout_method: transferSearch.payout_method,
      speed: transferSearch.speed,
      fee_amount: Number(computedFeeFrom.toFixed(2)),
      exchange_rate_used: Number(rate.toFixed(4)),
    }));
  }, [transferSearch, transferOptions, newFee.percent_fee, newFee.base_fee]);

  useEffect(() => {
    if (notificationsInterval) {
      clearInterval(notificationsInterval);
      setNotificationsInterval(null);
    }
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const notifRes = await api.listNotifications();
        setNotifications(normalizeListResponse(notifRes));
      } catch {
        // ignore polling errors
      }
    }, 1000);
    setNotificationsInterval(interval as unknown as number);
    return () => clearInterval(interval);
  }, [user]);

  const quotePreview = useMemo(() => {
    const rate = transferOptions?.rate ? Number(transferOptions.rate) : undefined;
    const sendAmount = Number(transferSearch.amount_from || 0);
    const feeFrom =
      transferOptions?.fee?.total !== undefined
        ? Number(transferOptions.fee.total)
        : rate && sendAmount > 0
        ? Number(newFee.base_fee + sendAmount * (newFee.percent_fee / 100))
        : undefined;
    const baseAmountTo =
      transferOptions?.amount_to !== undefined && transferOptions.amount_to !== null
        ? Number(transferOptions.amount_to)
        : rate && sendAmount > 0
        ? sendAmount * rate
        : undefined;
    const feeRecipient = feeFrom !== undefined && rate ? feeFrom * rate : undefined;
    const receiveAmount =
      baseAmountTo !== undefined ? Math.max(0, baseAmountTo - (feeRecipient ?? 0)) : undefined;
    return {
      rate,
      fee: feeFrom,
      total: rate && feeFrom !== undefined ? Number(sendAmount + feeFrom) : undefined,
      receiveAmount,
    };
  }, [transferOptions, newFee.base_fee, newFee.percent_fee, transferSearch.amount_from]);

  function setMessage(message: string, tone: ToastTone = "positive") {
    setToast(message);
    setToastTone(tone);
    setTimeout(() => setToast(null), 4000);
  }

  async function bootstrapFromApi() {
    setStatus((s) => ({ ...s, bootstrap: "loading" }));
    try {
      const me = await api.me();
      setUser(me);

      const [currRes, benRes, pmRes, offerRes, summaryRes, transferRes, notifRes] = await Promise.allSettled([
        api.listCurrencies(),
        api.listBeneficiaries(),
        api.listPaymentMethods(),
        api.listOffers(),
        api.adminSummary(),
        api.listTransfers(),
        api.listNotifications(),
      ]);

      if (currRes.status === "fulfilled") setCurrencies(normalizeListResponse(currRes.value));
      if (benRes.status === "fulfilled") setBeneficiaries(normalizeListResponse(benRes.value));
      if (pmRes.status === "fulfilled") setPaymentMethods(normalizeListResponse(pmRes.value));
      if (offerRes.status === "fulfilled") setOffers(normalizeListResponse(offerRes.value));
      if (summaryRes.status === "fulfilled") setAdminSummary(summaryRes.value);
      if (transferRes.status === "fulfilled") setTransfers(normalizeListResponse(transferRes.value));
      if (notifRes.status === "fulfilled") setNotifications(normalizeListResponse(notifRes.value));

      setMessage("Synced with backend API");
    } catch (err) {
      setMessage(`API sync failed: ${parseError(err)}`, "negative");
    } finally {
      setStatus((s) => ({ ...s, bootstrap: undefined }));
    }
  }

  async function handleAuthSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus((s) => ({ ...s, auth: "loading" }));
    try {
      const payload = { ...authForm };
      const res =
        authMode === "login"
          ? await api.login({ email: payload.email, password: payload.password })
          : await api.register(payload);

      const token =
        res?.token ||
        res?.access_token ||
        res?.data?.token ||
        res?.data?.access_token ||
        res?.authorisation?.token;
      if (token) {
        localStorage.setItem("token", token);
      }
      setAuthForm(authDefaults);
      setMessage(authMode === "login" ? "Logged in" : "Account created");
      await bootstrapFromApi();
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, auth: undefined }));
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setCurrencies(defaultCurrencies);
    setBeneficiaries(defaultBeneficiaries);
    setPaymentMethods(defaultPaymentMethods);
    setOffers(defaultOffers);
    setTransfers([]);
    setAdminSummary(null);
    setTransferOptions(null);
    setNotifications(sampleNotifications);
    setTransferSearch(transferSearchDefaults);
    setNewTransfer(transferDefaults());
    setNewBeneficiary(beneficiaryDefaults());
    setNewPaymentMethod(paymentMethodDefaults());
    setNewCurrency(currencyDefaults);
    setNewExchangeRate(exchangeRateDefaults());
    setNewFee(feeDefaults());
    setNewOffer(offerDefaults);
    setNewAgent(agentDefaults);
    setAuthMode("login");
    setAuthForm(authDefaults);
    setExpandedPanels({ search: false, wallet: false, transfers: false, admin: false, agents: false, reports: false, locator: false });
    setIsChatPage(false);
    setMessage("Logged out");
  }

  async function handleTransferSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canCustomerFlows && !canAdminFlows) {
      setMessage("Login as user or admin to search transfer options", "negative");
      return;
    }
    if (!transferSearch.from_currency_id || !transferSearch.to_currency_id || transferSearch.amount_from <= 0) {
      setMessage("Select currencies and enter a send amount before searching", "negative");
      return;
    }
    setStatus((s) => ({ ...s, quote: "loading" }));
    try {
      const raw = await api.getTransferOptions({
        from_currency_id: transferSearch.from_currency_id,
        to_currency_id: transferSearch.to_currency_id,
        amount_from: transferSearch.amount_from,
        payout_method: transferSearch.payout_method,
      });

      const rate = raw?.rate ?? raw?.exchange_rate?.rate ?? 0;
      const fee =
        raw?.fee?.total ??
        raw?.fees?.fee_after_offer ??
        raw?.fees?.fee_before_offer ??
        raw?.fees?.base_fee ??
        0;

      setTransferOptions({
        rate: rate ? Number(rate) : undefined,
        fee: {
          base: Number(raw?.fees?.base_fee ?? raw?.fee?.base ?? 0) || undefined,
          percent: Number(raw?.fees?.percent_fee ?? raw?.fee?.percent ?? 0) || undefined,
          discount: Number(raw?.fees?.discount ?? 0) || undefined,
          fee_after_offer: Number(raw?.fees?.fee_after_offer ?? 0) || undefined,
          total: fee ? Number(fee) : undefined,
        },
        total_to_pay: raw?.total_to_pay ? Number(raw.total_to_pay) : undefined,
        amount_to: raw?.exchange_rate?.amount_to ? Number(raw.exchange_rate.amount_to) : undefined,
      });
      setMessage("Transfer options refreshed");
    } catch (err) {
      setTransferOptions(null);
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, quote: undefined }));
    }
  }

  async function handleCreateBeneficiary(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canCustomerFlows && !canAdminFlows) {
      setMessage("Only users or admins can manage beneficiaries", "negative");
      return;
    }
    setStatus((s) => ({ ...s, beneficiary: "loading" }));
    try {
      const payload = {
        ...newBeneficiary,
        ...(isUser && user?.id ? { recipient_user_id: user.id } : {}),
      };
      let created: any = payload;
      if (localStorage.getItem("token")) {
        created = await api.createBeneficiary(payload);
      } else {
        created = { ...payload, id: Date.now() };
      }
      setBeneficiaries((prev) => [created, ...prev]);
      setNewBeneficiary(beneficiaryDefaults());
      setMessage("Beneficiary saved");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, beneficiary: undefined }));
    }
  }
  async function handleCreatePaymentMethod(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canCustomerFlows && !canAdminFlows) {
      setMessage("Only users or admins can add payment methods", "negative");
      return;
    }
    setStatus((s) => ({ ...s, payment: "loading" }));
    try {
      const payload = {
        ...newPaymentMethod,
      };
      let created: any = payload;
      if (localStorage.getItem("token")) {
        created = await api.createPaymentMethod(payload);
      } else {
        created = { ...payload, id: Date.now(), is_verified: false, status: "pending" };
      }
      const statusValue = created.status ?? (created.is_verified ? "approved" : "pending");
      setPaymentMethods((prev) => [
        { status: statusValue, is_verified: created.is_verified ?? statusValue === "approved", ...created },
        ...prev,
      ]);
      setNewPaymentMethod(paymentMethodDefaults(currencies[0]?.code || ""));
      setMessage("Payment method added");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, payment: undefined }));
    }
  }

  async function handleUpdatePaymentMethodStatus(id: number, statusValue: "approved" | "rejected" | "pending") {
    if (!isAdmin) {
      setMessage("Only admins can verify payment methods", "negative");
      return;
    }
    setStatus((s) => ({ ...s, paymentVerify: "loading" }));
    try {
      const payload = { status: statusValue, is_verified: statusValue === "approved" };
      const updated = await api.verifyPaymentMethod(id, payload);
      setPaymentMethods((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updated, status: statusValue, is_verified: statusValue === "approved" } : p
        )
      );
      setMessage(`Payment method marked as ${statusValue}`);
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, paymentVerify: undefined }));
    }
  }

  async function handleCreateTransfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canCustomerFlows && !canAdminFlows) {
      setMessage("Only users or admins can initiate transfers", "negative");
      return;
    }
    if (
      !newTransfer.beneficiary_id ||
      !newTransfer.payment_method_id ||
      !newTransfer.from_currency_id ||
      !newTransfer.to_currency_id ||
      Number(newTransfer.amount_from) <= 0
    ) {
      setMessage("Please complete transfer details before submitting", "negative");
      return;
    }
    setStatus((s) => ({ ...s, transfer: "loading" }));
    try {
      const payload = {
        ...newTransfer,
        amount_from: Number(newTransfer.amount_from),
        amount_to: Number(newTransfer.amount_to),
        fee_amount: Number(newTransfer.fee_amount),
        exchange_rate_used: Number(newTransfer.exchange_rate_used),
        metadata: {
          quote_source: transferOptions ? "api" : "offline",
          initiated_from: "React portal",
        },
      };
      let created: any = payload;
      if (localStorage.getItem("token")) {
        created = await api.createTransfer(payload);
      } else {
        created = { ...payload, id: Date.now(), status: "pending" };
      }
      setTransfers((prev) => [created, ...prev]);
      setNewTransfer(
        transferDefaults(
          transferSearch.from_currency_id,
          transferSearch.to_currency_id,
          transferSearch.payout_method,
          transferSearch.speed
        )
      );
      setMessage("Transfer initiated");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, transfer: undefined }));
    }
  }

  async function handleCreateCurrency(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canAdminFlows) {
      setMessage("Only admins can manage currencies", "negative");
      return;
    }
    setStatus((s) => ({ ...s, currency: "loading" }));
    try {
      let created: any = { ...newCurrency };
      if (localStorage.getItem("token")) {
        created = await api.createCurrency(newCurrency);
      } else {
        created = { ...newCurrency, id: Date.now() };
      }
      setCurrencies((prev) => [created, ...prev]);
      setNewCurrency(currencyDefaults);
      setMessage("Currency saved");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, currency: undefined }));
    }
  }

  async function handleCreateExchangeRate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canAdminFlows) {
      setMessage("Only admins can manage exchange rates", "negative");
      return;
    }
    setStatus((s) => ({ ...s, rate: "loading" }));
    try {
      let created: any = { ...newExchangeRate };
      const inversePayload =
        newExchangeRate.rate > 0
          ? {
              ...newExchangeRate,
              from_currency_id: newExchangeRate.to_currency_id,
              to_currency_id: newExchangeRate.from_currency_id,
              rate: Number((1 / newExchangeRate.rate).toFixed(6)),
            }
          : null;

      if (localStorage.getItem("token")) {
        created = await api.createExchangeRate(newExchangeRate);
        if (inversePayload) {
          await api.createExchangeRate(inversePayload);
        }
      } else {
        created = { ...newExchangeRate, id: Date.now() };
      }
      setMessage(
        inversePayload
          ? `Exchange rate recorded (inverse ${inversePayload.rate})`
          : "Exchange rate recorded"
      );
      setTransferSearch((prev) => ({
        ...prev,
        from_currency_id: created.from_currency_id,
        to_currency_id: created.to_currency_id,
      }));
      setNewExchangeRate(
        exchangeRateDefaults(newExchangeRate.from_currency_id, newExchangeRate.to_currency_id)
      );
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, rate: undefined }));
    }
  }

  async function handleCreateFee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canAdminFlows) {
      setMessage("Only admins can manage fee structures", "negative");
      return;
    }
    setStatus((s) => ({ ...s, fee: "loading" }));
    try {
      if (localStorage.getItem("token")) {
        await api.createFeeStructure(newFee);
      }
      setNewFee(feeDefaults());
      setMessage("Fee structure saved");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, fee: undefined }));
    }
  }

  async function handleCreateOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canAdminFlows) {
      setMessage("Only admins can manage offers", "negative");
      return;
    }
    setStatus((s) => ({ ...s, offer: "loading" }));
    try {
      let created: any = { ...newOffer };
      if (localStorage.getItem("token")) {
        created = await api.createOffer(newOffer);
      } else {
        created = { ...newOffer, id: Date.now() };
      }
      setOffers((prev) => [created, ...prev]);
      setNewOffer(offerDefaults);
      setMessage("Offer saved");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, offer: undefined }));
    }
  }

  async function handleAgentRegistration(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canAgentFlows) {
      setMessage("Only agents or admins can manage agent records", "negative");
      return;
    }
    if (!newAgent.working_from || !newAgent.working_to) {
      setMessage("Please select working hours", "negative");
      return;
    }
    setStatus((s) => ({ ...s, agent: "loading" }));
    try {
      let created: any = { ...newAgent };
      if (localStorage.getItem("token")) {
        created = await api.createAgent({
          ...newAgent,
          lat: Number(newAgent.lat),
          long: Number(newAgent.long),
          working_hours: [newAgent.working_from, newAgent.working_to],
        });
      } else {
        created = {
          ...newAgent,
          working_hours: [newAgent.working_from, newAgent.working_to],
          id: Date.now(),
          status: "pending",
        };
      }
      setAgents((prev) => [{ ...created, id: created.id ?? Date.now(), status: created.status ?? "pending" }, ...prev]);
      setNewAgent(agentDefaults);
      setMessage("Agent submitted for approval");
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, agent: undefined }));
    }
  }

  async function handleAgentStatusUpdate(id: number, statusValue: string) {
    if (!isAdmin) {
      setMessage("Only admins can update agent status", "negative");
      return;
    }
    setStatus((s) => ({ ...s, agentStatus: "loading" }));
    try {
      const updated = await api.updateAgent(id, { status: statusValue });
      setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated, status: statusValue } : a)));
      setMessage(`Agent marked as ${statusValue}`);
    } catch (err) {
      setMessage(parseError(err), "negative");
    } finally {
      setStatus((s) => ({ ...s, agentStatus: undefined }));
    }
  }

  async function handleChatSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content) return;
    setChatInput("");
    const currentMessages: ChatMessage[] = [...chatMessages, { role: "user", content }];
    setChatMessages(currentMessages);
    setChatLoading(true);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setChatMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await fetch("https://ai.aliawdeh.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma3:4b",
          messages: [{ role: "system", content: supportSystemPrompt }, ...currentMessages],
          stream: true,
        }),
      });

      if (!res.body) {
        const fallback = await res.json();
        const text =
          fallback?.message?.content ||
          fallback?.response ||
          JSON.stringify(fallback, null, 2) ||
          "No response from model.";
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: text };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const delta = parsed?.message?.content || parsed?.response || parsed?.content || "";
            assistantText += delta;
          } catch {
            assistantText += line;
          }
          setChatMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      }

      if (buffer.trim()) {
        assistantText += buffer.trim();
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch (err) {
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: `Chat error: ${parseError(err)}` };
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  }

  const togglePanel = (id: keyof typeof expandedPanels) => {
    setExpandedPanels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    return (
      <div className="page auth-page">
        <div className="page-surface" />
        {toast && <Toast message={toast} tone={toastTone} />}
        <div className="auth-wrapper">
          <AuthPanel
            authMode={authMode}
            setAuthMode={setAuthMode}
            authForm={authForm}
            setAuthForm={setAuthForm}
            onSubmit={handleAuthSubmit}
            onLogout={handleLogout}
            status={status}
            user={user}
            notifications={notifications}
            roleOptions={roleOptions}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-surface" />
      {toast && <Toast message={toast} tone={toastTone} />}

      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigateChat={() => setIsChatPage(true)}
        onNavigateHome={() => setIsChatPage(false)}
        isChatPage={isChatPage}
      />

      {isChatPage ? (
        <div className="chat-page">
          <SupportChatPanel
            messages={chatMessages}
            input={chatInput}
            onInputChange={setChatInput}
            onSend={handleChatSend}
            loading={chatLoading}
            systemPrompt={supportSystemPrompt}
            collapsed={false}
            variant="page"
          />
        </div>
      ) : (
        <>
          <Hero apiBase={API_BASE_URL} currenciesCount={currencies.length} beneficiariesCount={beneficiaries.length} />

          <NotificationsPanel notifications={notifications} />

          <main className="grid">
            {canCustomerFlows ? (
              <TransferSearchPanel
                transferSearch={transferSearch}
                setTransferSearch={setTransferSearch}
                onSubmit={handleTransferSearch}
                status={status}
                currencies={currencies}
                offers={offers}
                quotePreview={quotePreview}
                transferOptions={transferOptions}
                collapsed={!expandedPanels.search}
                onToggle={() => togglePanel("search")}
              />
            ) : (
              <SectionNotice
                id="search"
                title="Transfers & quotes"
                reason="Login as a user or admin to search routes, fees, and FX."
              />
            )}

            {canCustomerFlows ? (
              <WalletPanel
                paymentMethods={paymentMethods}
                beneficiaries={beneficiaries}
                newPaymentMethod={newPaymentMethod}
                setNewPaymentMethod={setNewPaymentMethod}
                newBeneficiary={newBeneficiary}
                setNewBeneficiary={setNewBeneficiary}
            onCreatePaymentMethod={handleCreatePaymentMethod}
            onUpdatePaymentMethodStatus={handleUpdatePaymentMethodStatus}
                onCreateBeneficiary={handleCreateBeneficiary}
                status={status}
                currencies={currencies}
                isAdmin={isAdmin}
                collapsed={!expandedPanels.wallet}
                onToggle={() => togglePanel("wallet")}
              />
            ) : (
              <SectionNotice
                id="wallet"
                title="Payment methods & beneficiaries"
                reason="Login as a user or admin to manage payout recipients and funding sources."
              />
            )}

            {canCustomerFlows ? (
              <TransfersPanel
                newTransfer={newTransfer}
                setNewTransfer={setNewTransfer}
                onCreateTransfer={handleCreateTransfer}
                status={status}
                beneficiaries={beneficiaries}
                paymentMethods={paymentMethods}
                offers={offers}
                agents={agents}
                currencies={currencies}
                transfers={transfers}
                collapsed={!expandedPanels.transfers}
                onToggle={() => togglePanel("transfers")}
              />
            ) : (
              <SectionNotice
                id="transfers"
                title="Transfers"
                reason="Login as a user or admin to create and track transfers."
              />
            )}

            {canAdminFlows ? (
              <AdminPanel
                currencies={currencies}
                offers={offers}
                newCurrency={newCurrency}
                setNewCurrency={setNewCurrency}
                newExchangeRate={newExchangeRate}
                setNewExchangeRate={setNewExchangeRate}
                newFee={newFee}
                setNewFee={setNewFee}
                newOffer={newOffer}
                setNewOffer={setNewOffer}
                onCreateCurrency={handleCreateCurrency}
                onCreateExchangeRate={handleCreateExchangeRate}
                onCreateFee={handleCreateFee}
                onCreateOffer={handleCreateOffer}
                status={status}
                collapsed={!expandedPanels.admin}
                onToggle={() => togglePanel("admin")}
              />
            ) : (
              <SectionNotice
                id="admin"
                title="Admin controls"
                reason="Only admins can configure currencies, FX, fees, and offers."
              />
            )}

        {canAgentFlows ? (
          <AgentsPanel
            agents={agents}
            newAgent={newAgent}
            setNewAgent={setNewAgent}
            onCreateAgent={handleAgentRegistration}
                status={status}
                isAdmin={isAdmin}
                onUpdateStatus={handleAgentStatusUpdate}
                collapsed={!expandedPanels.agents}
                onToggle={() => togglePanel("agents")}
              />
            ) : (
          <SectionNotice
            id="agents"
            title="Agents & partners"
            reason="Agents and admins can manage agent locations, approvals, and working hours."
          />
        )}

        {canCustomerFlows ? (
          <AgentLocatorPanel
            agents={agents}
            collapsed={!expandedPanels.locator}
            onToggle={() => togglePanel("locator")}
          />
        ) : (
          <SectionNotice id="agent-locator" title="Agent locator" reason="Login as a user or admin to view agent locations." />
        )}

            {canAdminFlows ? (
              <ReportsPanel
                adminSummary={adminSummary}
                transfersCount={transfers.length}
                agentsCount={agents.length}
                user={user}
                collapsed={!expandedPanels.reports}
                onToggle={() => togglePanel("reports")}
              />
            ) : (
              <SectionNotice id="reports" title="Reports" reason="Admin-only reporting and compliance summary." />
            )}
          </main>
        </>
      )}
    </div>
  );
}
