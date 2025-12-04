import type { Dispatch, FormEvent, SetStateAction } from "react";
import { formatCurrency } from "../lib/utils";
import type {
  Agent,
  Beneficiary,
  Currency,
  Offer,
  PaymentMethod,
  PayoutMethod,
  StatusMap,
  Transfer,
  TransferFormState,
  TransferSpeed,
} from "../types";
import { payoutOptions, speedOptions } from "../lib/options";

type Props = {
  newTransfer: TransferFormState;
  setNewTransfer: Dispatch<SetStateAction<TransferFormState>>;
  onCreateTransfer: (e: FormEvent<HTMLFormElement>) => void;
  status: StatusMap;
  onApproveTransfer?: (id: number) => void;
  canApprove?: boolean;
  beneficiaries: Beneficiary[];
  paymentMethods: PaymentMethod[];
  offers: Offer[];
  agents: Agent[];
  currencies: Currency[];
  transfers: Transfer[];
  collapsed: boolean;
  onToggle: () => void;
};

export function TransfersPanel({
  newTransfer,
  setNewTransfer,
  onCreateTransfer,
  status,
  onApproveTransfer,
  canApprove,
  beneficiaries,
  paymentMethods,
  offers,
  agents,
  currencies,
  transfers,
  collapsed,
  onToggle,
}: Props) {
  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="transfers">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Transfers</p>
          <h2>Initiate and track</h2>
        </div>
        <div className="inline-row">
          <div className="pill subtle">{transfers.length} created</div>
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "Create transfer" : "Hide"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <form className="form" onSubmit={onCreateTransfer}>
            <div className="form-grid">
              <label className="field">
                <span>Beneficiary</span>
                <select
                  value={newTransfer.beneficiary_id}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, beneficiary_id: Number(e.target.value) }))}
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.full_name} / {b.country}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Payment method</span>
                <select
                  value={newTransfer.payment_method_id}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, payment_method_id: Number(e.target.value) }))}
                >
                  {paymentMethods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.provider_name} ({p.type})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Agent (optional)</span>
                <select value={newTransfer.agent_id} onChange={(e) => setNewTransfer((p) => ({ ...p, agent_id: Number(e.target.value) }))}>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.store_name} / {a.city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Offer (optional)</span>
                <select value={newTransfer.offer_id} onChange={(e) => setNewTransfer((p) => ({ ...p, offer_id: Number(e.target.value) }))}>
                  <option value="">No offer</option>
                  {offers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Send amount</span>
                <input
                  type="number"
                  value={newTransfer.amount_from}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, amount_from: Number(e.target.value) }))}
                  min={1}
                  required
                />
              </label>
              <label className="field">
                <span>Receive amount</span>
                <input
                  type="number"
                  value={newTransfer.amount_to}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, amount_to: Number(e.target.value) }))}
                  min={1}
                  required
                />
              </label>
              <label className="field">
                <span>Fee amount</span>
                <input
                  type="number"
                  value={newTransfer.fee_amount}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, fee_amount: Number(e.target.value) }))}
                  onBlur={(e) =>
                    setNewTransfer((p) => ({
                      ...p,
                      fee_amount: Number(Number(e.target.value || 0).toFixed(2)),
                    }))
                  }
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  required
                />
              </label>
              <label className="field">
                <span>Exchange rate used</span>
                <input
                  type="number"
                  value={newTransfer.exchange_rate_used}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, exchange_rate_used: Number(e.target.value) }))}
                  step="0.0001"
                  required
                />
              </label>
              <label className="field">
                <span>Speed</span>
                <select value={newTransfer.speed} onChange={(e) => setNewTransfer((p) => ({ ...p, speed: e.target.value as TransferSpeed }))}>
                  {speedOptions.map((o) => (
                    <option key={o} value={o}>
                      {o.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Payout method</span>
                <select
                  value={newTransfer.payout_method}
                  onChange={(e) => setNewTransfer((p) => ({ ...p, payout_method: e.target.value as PayoutMethod }))}
                >
                  {payoutOptions.map((o) => (
                    <option key={o} value={o}>
                      {o.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="btn primary" type="submit" disabled={status.transfer === "loading"}>
              {status.transfer === "loading" ? "Creating..." : "Create transfer"}
            </button>
          </form>
          <div className="transfer-list">
            {transfers.slice(0, 4).map((t) => {
              const statusLabel = (t.status || "pending").toLowerCase();
              const isPending = statusLabel === "pending";
              const isApproving = t.id !== undefined && status.transferApprove === t.id.toString();
              return (
                <div key={t.id ?? `${t.beneficiary_id}-${t.payment_method_id}-${t.amount_from}`} className="transfer-card">
                  <div className="pill subtle">#{t.id ?? "pending"}</div>
                  <div className="transfer-main">
                    <div>
                      <div className="chip-title">
                        {formatCurrency(currencies.find((c) => c.id === t.from_currency_id)?.code || "FROM", t.amount_from)} →{" "}
                        {formatCurrency(currencies.find((c) => c.id === t.to_currency_id)?.code || "TO", t.amount_to)}
                      </div>
                      <div className="muted">
                        {t.speed} / {t.payout_method.replace("_", " ")} / fee {formatCurrency("FX", t.fee_amount)}
                      </div>
                    </div>
                    <div className="inline-row">
                      <div className={`pill ${isPending ? "subtle" : "good"}`}>{t.status || "pending"}</div>
                      {canApprove && isPending && t.id && onApproveTransfer && (
                        <button className="btn small" type="button" onClick={() => onApproveTransfer(t.id!)} disabled={isApproving}>
                          {isApproving ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {transfers.length === 0 && <p className="muted">Transfers will appear here after you submit.</p>}
          </div>
        </>
      )}
    </section>
  );
}
