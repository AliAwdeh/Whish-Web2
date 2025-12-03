import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  Beneficiary,
  BeneficiaryForm,
  Currency,
  PaymentMethod,
  PaymentMethodForm,
  PayoutMethod,
  StatusMap,
} from "../types";
import { payoutOptions } from "../lib/options";

type Props = {
  paymentMethods: PaymentMethod[];
  beneficiaries: Beneficiary[];
  newPaymentMethod: PaymentMethodForm;
  setNewPaymentMethod: Dispatch<SetStateAction<PaymentMethodForm>>;
  newBeneficiary: BeneficiaryForm;
  setNewBeneficiary: Dispatch<SetStateAction<BeneficiaryForm>>;
  onCreatePaymentMethod: (e: FormEvent<HTMLFormElement>) => void;
  onUpdatePaymentMethodStatus: (id: number, status: "approved" | "rejected") => void;
  onCreateBeneficiary: (e: FormEvent<HTMLFormElement>) => void;
  status: StatusMap;
  currencies: Currency[];
  isAdmin: boolean;
  collapsed: boolean;
  onToggle: () => void;
};

export function WalletPanel({
  paymentMethods,
  beneficiaries,
  newPaymentMethod,
  setNewPaymentMethod,
  newBeneficiary,
  setNewBeneficiary,
  onCreatePaymentMethod,
  onUpdatePaymentMethodStatus,
  onCreateBeneficiary,
  status,
  currencies,
  isAdmin,
  collapsed,
  onToggle,
}: Props) {
  const payoutFields: Record<string, { key: string; label: string; placeholder?: string }[]> = {
    bank_deposit: [
      { key: "iban", label: "IBAN / Account number", placeholder: "DE89 3704 0044 0532 0130 00" },
      { key: "account_number", label: "Account number", placeholder: "0123456789" },
      { key: "swift", label: "SWIFT/BIC", placeholder: "DEUTDEFF" },
      { key: "bank_name", label: "Bank name", placeholder: "Bank name" },
      { key: "account_name", label: "Account holder name", placeholder: "John Doe" },
    ],
    cash_pickup: [
      { key: "id_type", label: "ID Type", placeholder: "passport | national_id | driver_license" },
      { key: "id_number", label: "ID Number", placeholder: "123456789" },
      { key: "pickup_location", label: "Pickup location", placeholder: "Main branch" },
      { key: "recipient_phone", label: "Recipient phone", placeholder: "+1 555 000 0000" },
    ],
    mobile_wallet: [
      { key: "wallet_provider", label: "Wallet provider", placeholder: "M-Pesa" },
      { key: "phone", label: "Phone", placeholder: "+254 7xx xxx xxx" },
      { key: "wallet_id", label: "Wallet ID", placeholder: "user-1234" },
    ],
  };

  const activeFields = payoutFields[newBeneficiary.payout_method] || [];
  const paymentDetailFields: Record<
    PaymentMethodForm["type"],
    { key: string; label: string; placeholder?: string; type?: string }[]
  > = {
    bank_account: [
      { key: "iban", label: "IBAN / Account number", placeholder: "DE89 3704 0044 0532 0130 00" },
      { key: "account_number", label: "Account number", placeholder: "0123456789" },
      { key: "routing_number", label: "Routing number", placeholder: "110000000" },
      { key: "swift", label: "SWIFT/BIC", placeholder: "DEUTDEFF" },
      { key: "bank_name", label: "Bank name", placeholder: "Bank name" },
      { key: "account_name", label: "Account holder name", placeholder: "John Doe" },
    ],
    card: [
      { key: "brand", label: "Brand", placeholder: "visa | mastercard" },
      { key: "exp_month", label: "Exp month", placeholder: "12", type: "number" },
      { key: "exp_year", label: "Exp year", placeholder: "2026", type: "number" },
      { key: "funding", label: "Funding", placeholder: "debit | credit" },
    ],
    wallet: [
      { key: "provider", label: "Provider", placeholder: "paypal | mtn | vodafone" },
      { key: "account_id", label: "Account ID", placeholder: "user-1234" },
      { key: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
      { key: "label", label: "Label", placeholder: "My Wallet" },
    ],
  };

  const paymentActiveFields = paymentDetailFields[newPaymentMethod.type] || [];

  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="wallet">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Funding & payout</p>
          <h2>Payment methods & beneficiaries</h2>
        </div>
        <div className="inline-row">
          <div className="pill subtle">{beneficiaries.length} recipients</div>
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "Manage" : "Hide"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="panel-body two-col">
            <form className="form" onSubmit={onCreatePaymentMethod}>
              <p className="eyebrow">Payment method</p>
              <label className="field">
                <span>Type</span>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="bank_account">Bank account</option>
                  <option value="card">Card</option>
                  <option value="wallet">Wallet</option>
                </select>
              </label>
              <label className="field">
                <span>Provider</span>
                <input
                  value={newPaymentMethod.provider_name}
                  onChange={(e) => setNewPaymentMethod((p) => ({ ...p, provider_name: e.target.value }))}
                  placeholder="Bank / issuer"
                />
              </label>
              <label className="field">
                <span>Currency</span>
                <select
                  value={newPaymentMethod.currency}
                  onChange={(e) => setNewPaymentMethod((p) => ({ ...p, currency: e.target.value }))}
                >
                  {currencies.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Masked number</span>
                <input
                  value={newPaymentMethod.masked_number}
                  onChange={(e) => setNewPaymentMethod((p) => ({ ...p, masked_number: e.target.value }))}
                  placeholder="••••2345"
                />
              </label>
              {paymentActiveFields.map((field) => (
                <label className="field" key={field.key}>
                  <span>{field.label}</span>
                  <input
                    type={field.type || "text"}
                    value={(newPaymentMethod.details[field.key] as string) || ""}
                    onChange={(e) =>
                      setNewPaymentMethod((p) => ({
                        ...p,
                        details: {
                          ...p.details,
                          [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                        },
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <button className="btn primary" type="submit" disabled={status.payment === "loading"}>
                {status.payment === "loading" ? "Saving..." : "Save payment method"}
              </button>
            </form>

            {beneficiaries.length === 0 ? (
              <form className="form" onSubmit={onCreateBeneficiary}>
                <p className="eyebrow">Beneficiary</p>
                <label className="field">
                  <span>Full name</span>
                  <input
                    value={newBeneficiary.full_name}
                    onChange={(e) => setNewBeneficiary((p) => ({ ...p, full_name: e.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span>Country</span>
                  <input
                    value={newBeneficiary.country}
                    onChange={(e) => setNewBeneficiary((p) => ({ ...p, country: e.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span>City</span>
                  <input value={newBeneficiary.city} onChange={(e) => setNewBeneficiary((p) => ({ ...p, city: e.target.value }))} />
                </label>
                <label className="field">
                  <span>Payout method</span>
                  <select
                    value={newBeneficiary.payout_method}
                    onChange={(e) => setNewBeneficiary((p) => ({ ...p, payout_method: e.target.value as PayoutMethod }))}
                  >
                    {payoutOptions.map((o) => (
                      <option key={o} value={o}>
                        {o.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                {activeFields.map((field) => (
                  <label className="field" key={field.key as string}>
                    <span>{field.label}</span>
                    <input
                      value={newBeneficiary.payout_details[field.key as string] || ""}
                      onChange={(e) =>
                        setNewBeneficiary((p) => ({
                          ...p,
                          payout_details: { ...p.payout_details, [field.key]: e.target.value },
                        }))
                      }
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
                <button className="btn primary" type="submit" disabled={status.beneficiary === "loading"}>
                  {status.beneficiary === "loading" ? "Saving..." : "Save beneficiary"}
                </button>
              </form>
            ) : (
              <div className="form">
                <p className="eyebrow">Beneficiary</p>
                <p className="muted">A beneficiary exists, so the creation form is hidden.</p>
              </div>
            )}
          </div>
          <div className="chip-row">
            {beneficiaries.slice(0, 4).map((b) => (
              <div key={b.id} className="chip">
                <div className="pill subtle">#{b.id}</div>
                <div>
                  <div className="chip-title">{b.full_name}</div>
                  <div className="muted">
                    {b.country} / {b.payout_method.replace("_", " ")}
                  </div>
                </div>
              </div>
            ))}
            {paymentMethods.slice(0, 3).map((p) => {
              const statusLabel = p.status || (p.is_verified ? "approved" : "pending");
              return (
                <div key={p.id} className="chip">
                  <div className="pill subtle">{p.type}</div>
                  <div>
                    <div className="chip-title">{p.provider_name}</div>
                    <div className="muted">
                      {p.currency} / {p.masked_number} / {statusLabel}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="inline-row">
                      <button
                        className="btn ghost small"
                        type="button"
                        onClick={() => onUpdatePaymentMethodStatus(p.id, "approved")}
                        disabled={status.paymentVerify === "loading" || statusLabel === "approved"}
                      >
                        Approve
                      </button>
                      <button
                        className="btn ghost small"
                        type="button"
                        onClick={() => onUpdatePaymentMethodStatus(p.id, "rejected")}
                        disabled={status.paymentVerify === "loading" || statusLabel === "rejected"}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
