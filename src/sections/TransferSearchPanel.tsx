import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  Currency,
  Offer,
  PayoutMethod,
  StatusMap,
  TransferOptionsResult,
  TransferSearchState,
  TransferSpeed,
} from "../types";
import { payoutOptions, speedOptions } from "../lib/options";
import { formatCurrency } from "../lib/utils";

type QuotePreview = { rate?: number; fee?: number; total?: number; receiveAmount?: number };

type Props = {
  transferSearch: TransferSearchState;
  setTransferSearch: Dispatch<SetStateAction<TransferSearchState>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: StatusMap;
  currencies: Currency[];
  offers: Offer[];
  quotePreview: QuotePreview;
  transferOptions: TransferOptionsResult | null;
  collapsed: boolean;
  onToggle: () => void;
};

export function TransferSearchPanel({
  transferSearch,
  setTransferSearch,
  onSubmit,
  status,
  currencies,
  offers,
  quotePreview,
  transferOptions,
  collapsed,
  onToggle,
}: Props) {
  const rateDisplay = transferOptions?.rate ? Number(transferOptions.rate).toFixed(6) : "--";
  const feeDisplay = quotePreview.fee && transferSearch.amount_from > 0 ? quotePreview.fee : undefined;
  const receiveDisplay =
    quotePreview.receiveAmount && transferSearch.amount_from > 0 ? quotePreview.receiveAmount : undefined;

  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="search">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Transfer options</p>
          <h2>Search routes, fees, FX, offers</h2>
        </div>
        <div className="inline-row">
          <span className="pill subtle">{offers.length} active offers</span>
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "Get options" : "Hide"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <form className="form" onSubmit={onSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>From currency</span>
                <select
                  value={transferSearch.from_currency_id}
                  onChange={(e) => setTransferSearch((p) => ({ ...p, from_currency_id: Number(e.target.value) }))}
                >
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} / {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>To currency</span>
                <select
                  value={transferSearch.to_currency_id}
                  onChange={(e) => setTransferSearch((p) => ({ ...p, to_currency_id: Number(e.target.value) }))}
                >
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} / {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Send amount</span>
                <input
                  type="number"
                  value={transferSearch.amount_from}
                  onChange={(e) => setTransferSearch((p) => ({ ...p, amount_from: Number(e.target.value) }))}
                  min={1}
                  required
                />
              </label>
              <label className="field">
                <span>Payout method</span>
                <select
                  value={transferSearch.payout_method}
                  onChange={(e) => setTransferSearch((p) => ({ ...p, payout_method: e.target.value as PayoutMethod }))}
                >
                  {payoutOptions.map((o) => (
                    <option key={o} value={o}>
                      {o.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Speed</span>
                <select
                  value={transferSearch.speed}
                  onChange={(e) => setTransferSearch((p) => ({ ...p, speed: e.target.value as TransferSpeed }))}
                >
                  {speedOptions.map((o) => (
                    <option key={o} value={o}>
                      {o.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="btn primary" type="submit" disabled={status.quote === "loading"}>
              {status.quote === "loading" ? "Calculating..." : "Get options"}
            </button>
          </form>
          <div className="quote">
            <div>
              <p className="muted">Live preview</p>
              <h3>{formatCurrency("FROM", transferSearch.amount_from)}</h3>
              <p className="muted">Send amount</p>
            </div>
            <div>
              <p className="muted">Rate</p>
              <h3>{rateDisplay}</h3>
              <p className="muted">Exchange rate (populates after Get options)</p>
            </div>
            <div>
              <p className="muted">Fees</p>
              <h3>
                {feeDisplay !== undefined
                  ? formatCurrency(
                      currencies.find((c) => c.id === transferSearch.from_currency_id)?.code || "FX",
                      feeDisplay
                    )
                  : "--"}
              </h3>
              <p className="muted">Base + % fee (filled after Get options)</p>
            </div>
            <div>
              <p className="muted">Recipient gets</p>
              <h3>{receiveDisplay !== undefined ? formatCurrency("TO", receiveDisplay) : "--"}</h3>
              <p className="muted">After fees (post-calculation)</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
