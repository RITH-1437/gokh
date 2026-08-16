import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message?: string
}

const toasts = ref<Toast[]>([])
let nextId = 1

const remove = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export const useToasts = () => {
  const push = (toast: Omit<Toast, 'id'>, duration = 3200) => {
    const id = nextId++
    toasts.value.push({ ...toast, id })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  const success = (title: string, message?: string, duration?: number) =>
    push({ type: 'success', title, message }, duration)
  const info = (title: string, message?: string, duration?: number) =>
    push({ type: 'info', title, message }, duration)
  const warning = (title: string, message?: string, duration?: number) =>
    push({ type: 'warning', title, message }, duration)
  const error = (title: string, message?: string, duration?: number) =>
    push({ type: 'error', title, message }, duration)

  return { toasts, push, remove, success, info, warning, error }
}