import { useEffect } from 'react'
import type { ToastItem } from '../types/toast'
import { useGame } from '../state/useGame'

export function RewardToastStack() {
  const { toasts, dismissToast } = useGame()

  return (
    <div className="toast-stack" aria-live="assertive">
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  )
}

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => onDismiss(toast.id), 4200)
    return () => window.clearTimeout(id)
  }, [toast.id, onDismiss])

  if (toast.kind === 'xp') {
    return (
      <div className="toast toast-xp toast-enter" role="status">
        <span className="toast-icon" aria-hidden>
          ✧
        </span>
        <div>
          <strong>+{toast.amount} XP</strong>
          <p>{toast.message}</p>
        </div>
        <button type="button" className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
          ×
        </button>
      </div>
    )
  }
  if (toast.kind === 'level') {
    return (
      <div className="toast toast-level toast-enter" role="status">
        <span className="toast-icon" aria-hidden>
          ⬆
        </span>
        <div>
          <strong>Level up!</strong>
          <p>You reached level {toast.level}.</p>
        </div>
        <button type="button" className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
          ×
        </button>
      </div>
    )
  }
  if (toast.kind === 'badge') {
    return (
      <div className="toast toast-badge toast-enter" role="status">
        <span className="toast-icon" aria-hidden>
          🏅
        </span>
        <div>
          <strong>Badge unlocked</strong>
          <p>{toast.name}</p>
        </div>
        <button type="button" className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
          ×
        </button>
      </div>
    )
  }
  return null
}
