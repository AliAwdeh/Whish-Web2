export type AuthMode = "login" | "register";
export type PayoutMethod = "bank_deposit" | "cash_pickup" | "mobile_wallet";
export type TransferSpeed = "instant" | "same_day" | "standard";

export type RoleOption = { value: string; label: string };
export type Currency = { id: number; code: string; name: string; is_active?: boolean };
export type Beneficiary = {
  id: number;
  full_name: string;
  country: string;
  city?: string;
  payout_method: PayoutMethod;
  payout_details?: unknown;
  recipient_user_id?: number | string | null;
};
export type PaymentMethod = {
  id: number;
  type: string;
  provider_name?: string;
  currency: string;
  masked_number?: string;
  status?: string;
  is_verified?: boolean;
  details?: unknown;
};
export type Offer = {
  id: number | string;
  title: string;
  description?: string;
  discount_percent?: number;
  is_active?: boolean;
  ends_at?: string;
  starts_at?: string;
};
export type Agent = {
  id: number;
  store_name: string;
  city?: string;
  country?: string;
  lat?: number;
  long?: number;
  lng?: number;
  status?: string;
  working_hours?: string | string[];
  address?: string;
};
export type NotificationItem = { id: number; title?: string; detail?: string; read?: boolean; message?: string; type?: string; data?: Record<string, unknown> };
export type RichNotification = NotificationItem & {
  type?: string;
  message?: string;
  data?: Record<string, unknown>;
};
export type Transfer = {
  id?: number;
  from_currency_id: number;
  to_currency_id: number;
  amount_from: number;
  amount_to: number;
  fee_amount: number;
  exchange_rate_used: number;
  speed: TransferSpeed;
  payout_method: PayoutMethod;
  status?: string;
  beneficiary_id?: number;
  payment_method_id?: number;
  agent_id?: number;
  offer_id?: number;
};
export type AdminSummary = { transfers?: number; users?: number; agents?: number; disputes?: number };
export type TransferOptionsResult = {
  rate?: number | string;
  fee?: { base?: number; percent?: number; total?: number; discount?: number; fee_after_offer?: number };
  total_to_pay?: number;
  amount_to?: number;
};
export type StatusMap = Record<string, string | undefined>;
export type ToastTone = "positive" | "negative";

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export type AuthFormState = { name: string; email: string; password: string; role: string };
export type TransferSearchState = {
  from_currency_id: number | string;
  to_currency_id: number | string;
  amount_from: number;
  payout_method: PayoutMethod;
  speed: TransferSpeed;
};
export type TransferFormState = {
  beneficiary_id: number | string;
  payment_method_id: number | string;
  agent_id?: number | string;
  offer_id?: number | string;
  from_currency_id: number | string;
  to_currency_id: number | string;
  amount_from: number;
  amount_to: number;
  fee_amount: number;
  exchange_rate_used: number;
  speed: TransferSpeed;
  payout_method: PayoutMethod;
};
export type BeneficiaryForm = {
  full_name: string;
  country: string;
  city?: string;
  payout_method: PayoutMethod;
  payout_details: Record<string, string>;
  recipient_user_id?: number | string | null;
};
export type PaymentMethodForm = {
  type: string;
  provider_name: string;
  currency: string;
  masked_number: string;
  details: Record<string, string | number>;
};
export type CurrencyForm = { code: string; name: string; is_active: boolean };
export type ExchangeRateForm = {
  from_currency_id: number | string;
  to_currency_id: number | string;
  rate: number;
  valid_from: string;
  valid_to: string;
};
export type FeeForm = {
  from_currency_id: number | string;
  to_currency_id: number | string;
  payout_method: PayoutMethod;
  base_fee: number;
  percent_fee: number;
  is_active: boolean;
};
export type OfferForm = {
  title: string;
  description: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};
export type AgentForm = {
  store_name: string;
  address: string;
  city: string;
  country: string;
  lat: string;
  long: string;
  working_from: string;
  working_to: string;
};

export type User = { id?: number; name?: string; email?: string; role?: string };
