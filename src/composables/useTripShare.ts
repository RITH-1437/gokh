import { ref } from 'vue'
import type { Trip } from '../types/trip'
import { createShareLink, extractTripFromUrl } from '../utils/encoding'
import type { ShareLinkInfo } from '../utils/encoding'

export const useTripShare = () => {
  const shareUrl = ref('')
  /** Fingerprint + time of the last link created, so the sender can quote it. */
  const shareInfo = ref<ShareLinkInfo | null>(null)
  const isCopied = ref(false)
  const isSharing = ref(false)
  const error = ref<string | null>(null)

  const generateShareUrl = async (trip: Trip): Promise<string> => {
    try {
      const link = await createShareLink(trip)
      shareUrl.value = link.url
      shareInfo.value = { id: link.id, sharedAt: link.sharedAt }
      return link.url
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
      // Build the link exactly once. It is deliberately NOT written into the
      // address bar: a refresh would then reload this snapshot as a "shared
      // trip" and overwrite any edits made after sharing.
      const url = await generateShareUrl(trip)
      if (!url) return false

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

  const loadSharedTrip = async (): Promise<Trip | null> => {
    try {
      return await extractTripFromUrl()
    } catch (err) {
      error.value = 'Failed to load shared trip'
      console.error(err)
      return null
    }
  }

  return {
    shareUrl,
    shareInfo,
    isCopied,
    isSharing,
    error,
    generateShareUrl,
    copyToClipboard,
    shareTrip,
    loadSharedTrip,
  }
}
