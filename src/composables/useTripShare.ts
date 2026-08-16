import { ref } from 'vue'
import type { Trip } from '../types/trip'
import { generateTripUrl, extractTripFromUrl } from '../utils/encoding'

export const useTripShare = () => {
  const shareUrl = ref('')
  const isCopied = ref(false)
  const isSharing = ref(false)
  const error = ref<string | null>(null)

  const generateShareUrl = (trip: Trip): string => {
    try {
      const url = generateTripUrl(trip)
      shareUrl.value = url
      return url
    } catch (err) {
      error.value = 'Failed to generate share URL'
      console.error(err)
      return ''
    }
  }

  const copyToClipboard = async (url: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!copied) throw new Error('execCommand copy failed')
      }
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
      return true
    } catch (err) {
      error.value = 'Failed to copy to clipboard'
      console.error(err)
      return false
    }
  }

  const shareTrip = async (trip: Trip): Promise<boolean> => {
    isSharing.value = true
    error.value = null

    try {
      const url = generateShareUrl(trip)

      // Update browser URL
      updateBrowserUrl(trip)

      // Always copy to clipboard. The native share sheet (navigator.share)
      // opens a small system modal that can hang the UI on desktop, tablet
      // and mobile, so we avoid it entirely for a reliable one-tap copy.
      return await copyToClipboard(url)
    } catch (err) {
      error.value = 'Failed to share trip'
      console.error(err)
      return false
    } finally {
      isSharing.value = false
    }
  }

  const loadSharedTrip = (): Trip | null => {
    try {
      return extractTripFromUrl()
    } catch (err) {
      error.value = 'Failed to load shared trip'
      console.error(err)
      return null
    }
  }

  const updateBrowserUrl = (trip: Trip) => {
    try {
      const url = generateTripUrl(trip)
      window.history.replaceState({}, '', url)
    } catch (err) {
      console.error('Failed to update browser URL:', err)
    }
  }

  return {
    shareUrl,
    isCopied,
    isSharing,
    error,
    generateShareUrl,
    copyToClipboard,
    shareTrip,
    loadSharedTrip,
    updateBrowserUrl
  }
}
