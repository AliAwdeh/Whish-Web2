import type { ToastTone } from "../types";

type ToastProps = {
  message: string;
  tone?: ToastTone;
};

export function Toast({ message, tone = "positive" }: ToastProps) {
  return <div className={`toast ${tone === "positive" ? "toast-good" : "toast-bad"}`}>{message}</div>;
}
