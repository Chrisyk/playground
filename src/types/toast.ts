export type ToastPayload =
  | { kind: 'xp'; amount: number; message: string }
  | { kind: 'level'; level: number }
  | { kind: 'badge'; badgeId: string; name: string }

export type ToastItem = ToastPayload & { id: string }
