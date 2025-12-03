export function formatCurrency(code: string, value: number) {
  const numericValue = Number(value ?? 0);
  return `${code} ${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseError(err: unknown) {
  if (!err) return "Unexpected error";
  if (typeof err === "string") return err;
  const anyErr = err as any;
  if (anyErr?.message) return anyErr.message;
  if (anyErr?.errors && typeof anyErr.errors === "object") {
    const firstKey = Object.keys(anyErr.errors)[0];
    if (firstKey && Array.isArray(anyErr.errors[firstKey])) return anyErr.errors[firstKey][0];
  }
  if (anyErr?.status) return `Request failed (${anyErr.status})`;
  return "Something went wrong";
}

export function parseJsonIfPossible(value: string): unknown {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
}
