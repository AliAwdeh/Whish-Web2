import type { PayoutMethod, RoleOption, TransferSpeed } from "../types";

export const payoutOptions: PayoutMethod[] = ["bank_deposit", "cash_pickup", "mobile_wallet"];
export const speedOptions: TransferSpeed[] = ["instant", "same_day", "standard"];
export const roleOptions: RoleOption[] = [
  { value: "user", label: "Regular user" },
  { value: "agent", label: "Agent / Partner store" },
  { value: "admin", label: "Admin (platform)" },
];
