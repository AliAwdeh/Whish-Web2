import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  Currency,
  CurrencyForm,
  ExchangeRateForm,
  FeeForm,
  Offer,
  OfferForm,
  PayoutMethod,
  StatusMap,
} from "../types";
import { payoutOptions } from "../lib/options";

type Props = {
  currencies: Currency[];
  offers: Offer[];
  newCurrency: CurrencyForm;
  setNewCurrency: Dispatch<SetStateAction<CurrencyForm>>;
  newExchangeRate: ExchangeRateForm;
  setNewExchangeRate: Dispatch<SetStateAction<ExchangeRateForm>>;
  newFee: FeeForm;
  setNewFee: Dispatch<SetStateAction<FeeForm>>;
  newOffer: OfferForm;
  setNewOffer: Dispatch<SetStateAction<OfferForm>>;
  onCreateCurrency: (e: FormEvent<HTMLFormElement>) => void;
  onCreateExchangeRate: (e: FormEvent<HTMLFormElement>) => void;
  onCreateFee: (e: FormEvent<HTMLFormElement>) => void;
  onCreateOffer: (e: FormEvent<HTMLFormElement>) => void;
  status: StatusMap;
  collapsed: boolean;
  onToggle: () => void;
};

export function AdminPanel({
  currencies,
  offers,
  newCurrency,
  setNewCurrency,
  newExchangeRate,
  setNewExchangeRate,
  newFee,
  setNewFee,
  newOffer,
  setNewOffer,
  onCreateCurrency,
  onCreateExchangeRate,
  onCreateFee,
  onCreateOffer,
  status,
  collapsed,
  onToggle,
}: Props) {
  const inverseRate = newExchangeRate.rate ? Number((1 / newExchangeRate.rate).toFixed(6)) : null;

  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="admin">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h2>Currencies, FX, fee structures & offers</h2>
        </div>
        <div className="inline-row">
          <div className="pill subtle">Admin-only endpoints</div>
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "Configure" : "Hide"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="panel-body two-col">
            <form className="form" onSubmit={onCreateCurrency}>
              <p className="eyebrow">Currency</p>
              <label className="field">
                <span>Code</span>
                <input
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  maxLength={3}
                />
              </label>
              <label className="field">
                <span>Name</span>
                <input value={newCurrency.name} onChange={(e) => setNewCurrency((p) => ({ ...p, name: e.target.value }))} />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={newCurrency.is_active}
                  onChange={(e) => setNewCurrency((p) => ({ ...p, is_active: e.target.checked }))}
                />
                <span>Is active</span>
              </label>
              <button className="btn primary" type="submit" disabled={status.currency === "loading"}>
                Save currency
              </button>
            </form>

            <form className="form" onSubmit={onCreateExchangeRate}>
              <p className="eyebrow">Exchange rate</p>
              <div className="form-grid">
                <label className="field">
                  <span>From</span>
                  <select
                    value={newExchangeRate.from_currency_id}
                    onChange={(e) => setNewExchangeRate((p) => ({ ...p, from_currency_id: Number(e.target.value) }))}
                  >
                    {currencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>To</span>
                  <select
                    value={newExchangeRate.to_currency_id}
                    onChange={(e) => setNewExchangeRate((p) => ({ ...p, to_currency_id: Number(e.target.value) }))}
                  >
                    {currencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Rate</span>
                  <input
                    type="number"
                    value={newExchangeRate.rate}
                    step="0.0001"
                    onChange={(e) => setNewExchangeRate((p) => ({ ...p, rate: Number(e.target.value) }))}
                  />
                </label>
                <label className="field">
                  <span>Valid from</span>
                  <input
                    type="date"
                    value={newExchangeRate.valid_from}
                    onChange={(e) => setNewExchangeRate((p) => ({ ...p, valid_from: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Valid to</span>
                  <input
                    type="date"
                    value={newExchangeRate.valid_to}
                    onChange={(e) => setNewExchangeRate((p) => ({ ...p, valid_to: e.target.value }))}
                  />
                </label>
              </div>
              <div className="inline-row">
                <span className="pill subtle">Inverse: {inverseRate ? inverseRate : "n/a"}</span>
                <span className="muted">Auto-calculates reverse rate on save.</span>
              </div>
              <button className="btn primary" type="submit" disabled={status.rate === "loading"}>
                Save exchange rate
              </button>
            </form>
          </div>
          <div className="panel-body two-col">
            <form className="form" onSubmit={onCreateFee}>
              <p className="eyebrow">Fee structure</p>
              <div className="form-grid">
                <label className="field">
                  <span>From currency</span>
                  <select value={newFee.from_currency_id} onChange={(e) => setNewFee((p) => ({ ...p, from_currency_id: Number(e.target.value) }))}>
                    {currencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>To currency</span>
                  <select value={newFee.to_currency_id} onChange={(e) => setNewFee((p) => ({ ...p, to_currency_id: Number(e.target.value) }))}>
                    {currencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Payout method</span>
                  <select
                    value={newFee.payout_method}
                    onChange={(e) => setNewFee((p) => ({ ...p, payout_method: e.target.value as PayoutMethod }))}
                  >
                    {payoutOptions.map((o) => (
                      <option key={o} value={o}>
                        {o.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Base fee</span>
                  <input type="number" value={newFee.base_fee} onChange={(e) => setNewFee((p) => ({ ...p, base_fee: Number(e.target.value) }))} min={0} />
                </label>
                <label className="field">
                  <span>Percent fee</span>
                  <input
                    type="number"
                    value={newFee.percent_fee}
                    onChange={(e) => setNewFee((p) => ({ ...p, percent_fee: Number(e.target.value) }))}
                    min={0}
                  />
                </label>
              </div>
              <label className="checkbox">
                <input type="checkbox" checked={newFee.is_active} onChange={(e) => setNewFee((p) => ({ ...p, is_active: e.target.checked }))} />
                <span>Is active</span>
              </label>
              <button className="btn primary" type="submit" disabled={status.fee === "loading"}>
                Save fee structure
              </button>
            </form>

            <form className="form" onSubmit={onCreateOffer}>
              <p className="eyebrow">Offer</p>
              <label className="field">
                <span>Title</span>
                <input value={newOffer.title} onChange={(e) => setNewOffer((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={3} value={newOffer.description} onChange={(e) => setNewOffer((p) => ({ ...p, description: e.target.value }))} />
              </label>
              <label className="field">
                <span>Discount percent</span>
                <input
                  type="number"
                  value={newOffer.discount_percent}
                  onChange={(e) => setNewOffer((p) => ({ ...p, discount_percent: Number(e.target.value) }))}
                  min={0}
                />
              </label>
              <label className="field">
                <span>Starts at</span>
                <input type="date" value={newOffer.starts_at} onChange={(e) => setNewOffer((p) => ({ ...p, starts_at: e.target.value }))} />
              </label>
              <label className="field">
                <span>Ends at</span>
                <input type="date" value={newOffer.ends_at} onChange={(e) => setNewOffer((p) => ({ ...p, ends_at: e.target.value }))} />
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={newOffer.is_active} onChange={(e) => setNewOffer((p) => ({ ...p, is_active: e.target.checked }))} />
                <span>Is active</span>
              </label>
              <button className="btn primary" type="submit" disabled={status.offer === "loading"}>
                Save offer
              </button>
            </form>
          </div>
          <div className="chip-row">
            {currencies.slice(0, 6).map((c) => (
              <div key={c.id} className="chip">
                <div className="pill subtle">#{c.id}</div>
                <div>
                  <div className="chip-title">{c.code}</div>
                  <div className="muted">{c.name}</div>
                </div>
              </div>
            ))}
            {offers.slice(0, 3).map((o) => (
              <div key={o.id} className="chip">
                <div className="pill good">{o.discount_percent}%</div>
                <div>
                  <div className="chip-title">{o.title}</div>
                  <div className="muted">{o.description || "Offer active"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
