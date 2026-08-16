import type { Currency } from '../types/trip'

export const USD_TO_KHR = 4000

export const usdToKhr = (usd: number): number => usd * USD_TO_KHR
export const khrToUsd = (khr: number): number => khr / USD_TO_KHR

export const currencySymbol = (currency: Currency): string => (currency === 'USD' ? '$' : '៛')
export const currencyCode = (currency: Currency): string => (currency === 'USD' ? 'USD' : 'KHR')

// Numeric part only, grouped for KHR, decimals trimmed for whole USD amounts.
export const formatNumber = (amount: number, currency: Currency): string => {
  if (currency === 'USD') {
    const rounded = Math.round(amount * 100) / 100
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2)
  }
  return Math.round(amount).toLocaleString('en-US')
}

// Full string, e.g. "$100" or "400,000 KHR"
export const formatCurrency = (amount: number, currency: Currency): string => {
  if (currency === 'USD') {
    return `$${formatNumber(amount, 'USD')}`
  }
  return `${formatNumber(amount, 'KHR')} KHR`
}

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount
  if (from === 'USD' && to === 'KHR') return usdToKhr(amount)
  if (from === 'KHR' && to === 'USD') return khrToUsd(amount)
  return amount
}

export const getCurrencySymbol = (currency: Currency): string => currencySymbol(currency)