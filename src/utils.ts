
import type { MessageInstance } from "antd/es/message/interface";

export function toCapitalCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function showSuccessMessage(message?: MessageInstance, text?: string) {
  message?.open({ type: 'success', content: text });
}

export function showErrorMessage(message?: MessageInstance, error?: Error) {
  message?.open({ type: 'error', content: error?.message });
}
