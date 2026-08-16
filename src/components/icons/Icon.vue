<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :stroke-linecap="strokeLinecap"
    :stroke-linejoin="strokeLinejoin"
    v-html="iconPath"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  fill?: string
  stroke?: string
  strokeWidth?: number | string
  strokeLinecap?: 'round' | 'butt' | 'square'
  strokeLinejoin?: 'round' | 'miter' | 'bevel'
}>(), {
  size: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
})

const icons: Record<string, { viewBox: string; path: string }> = {
  // Navigation & UI
  'share': {
    viewBox: '0 0 24 24',
    path: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'
  },
  'menu': {
    viewBox: '0 0 24 24',
    path: '<line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>'
  },
  'x': {
    viewBox: '0 0 24 24',
    path: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    path: '<polyline points="6 9 12 15 18 9"/>'
  },
  'chevron-up': {
    viewBox: '0 0 24 24',
    path: '<polyline points="18 15 12 9 6 15"/>'
  },
  'check': {
    viewBox: '0 0 24 24',
    path: '<polyline points="20 6 9 17 4 12"/>'
  },
  'alert-triangle': {
    viewBox: '0 0 24 24',
    path: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  },
  'info': {
    viewBox: '0 0 24 24',
    path: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  },
  'alert-circle': {
    viewBox: '0 0 24 24',
    path: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
  },
  'check-circle': {
    viewBox: '0 0 24 24',
    path: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
  },
  
  // Travel & Transportation
  'map-pin': {
    viewBox: '0 0 24 24',
    path: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
  },
  'calendar': {
    viewBox: '0 0 24 24',
    path: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
  },
  'clock': {
    viewBox: '0 0 24 24',
    path: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
  },
  'users': {
    viewBox: '0 0 24 24',
    path: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  'user': {
    viewBox: '0 0 24 24',
    path: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
  },
  'crown': {
    viewBox: '0 0 24 24',
    path: '<path d="M2 4l3 12h14l3-12-6 8-6-8z"/>'
  },
  'bike': {
    viewBox: '0 0 24 24',
    path: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2"/><path d="M5.5 14h.01"/><path d="M18.5 14h.01"/><path d="M5.5 14a2.5 2.5 0 0 0 0 5"/><path d="M18.5 14a2.5 2.5 0 0 0 0 5"/><path d="M12 14v5"/>'
  },
  'car': {
    viewBox: '0 0 24 24',
    path: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-2.7.6-2.9 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'
  },
  'bus': {
    viewBox: '0 0 24 24',
    path: '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h.01"/><path d="M22 12h.01"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M10 12h4"/><path d="M8 12V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"/><circle cx="7" cy="16" r="1"/><circle cx="17" cy="16" r="1"/>'
  },
  
  // Accommodation
  'home': {
    viewBox: '0 0 24 24',
    path: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
  },
  'building': {
    viewBox: '0 0 24 24',
    path: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>'
  },
  'camp': {
    viewBox: '0 0 24 24',
    path: '<path d="M19 11l-8-8-8.6 8.6a2 2 0 0 0-.1 2.8l5.5 5.5c.4.4 1 .4 1.4 0l5.5-5.5a2 2 0 0 0-.1-2.8z"/><path d="M14 4h6"/>'
  },
  'tent': {
    viewBox: '0 0 24 24',
    path: '<path d="M19 12 3 12 19 12"/><path d="M19 12 3 12 19 12"/><path d="M12 2 3 12 12 22"/><path d="M12 2 21 12 12 22"/>'
  },
  
  // Weather
  'sun': {
    viewBox: '0 0 24 24',
    path: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>'
  },
  'cloud': {
    viewBox: '0 0 24 24',
    path: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'
  },
  'cloud-rain': {
    viewBox: '0 0 24 24',
    path: '<path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M16 13v8"/><path d="M8 13v8"/><path d="M12 15v8"/>'
  },
  'cloud-sun': {
    viewBox: '0 0 24 24',
    path: '<path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8-8z"/>'
  },
  
  // Activities
  'compass': {
    viewBox: '0 0 24 24',
    path: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 7.76 7.76 9.88 9.88 16.24 7.76 16.24 9.88 14.12 14.12 16.24 7.76"/>'
  },
  'mountain': {
    viewBox: '0 0 24 24',
    path: '<path d="m8 3 4 8 5-5v5"/><path d="M17.5 14 4 21"/>'
  },
  'map': {
    viewBox: '0 0 24 24',
    path: '<polygon points="1 6 1 22 8 18 15 2 15 22 1 15 8 18 15 1 22 1 6"/>'
  },
  'navigation': {
    viewBox: '0 0 24 24',
    path: '<polygon points="3 11 22 2 13 22 3 11"/>'
  },
  
  // Budget & Finance
  'wallet': {
    viewBox: '0 0 24 24',
    path: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4"/><path d="M3 5v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5"/>'
  },
  'dollar-sign': {
    viewBox: '0 0 24 24',
    path: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
  },
  'piggy-bank': {
    viewBox: '0 0 24 24',
    path: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-2.4-1.7-5.3-2-8-2-2.7 0-5.6.3-8 2-.2-.6-1.5-2-3-2V4a1 1 0 0 1 1-1c1.6 0 3.1.4 4.5 1.1"/><path d="M6 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M12 4v7a2 2 0 1 0 4 0V4"/>'
  },
  
  // Actions
  'edit': {
    viewBox: '0 0 24 24',
    path: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3-3z"/>'
  },
  'trash-2': {
    viewBox: '0 0 24 24',
    path: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'
  },
  'plus': {
    viewBox: '0 0 24 24',
    path: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
  },
  'arrow-right': {
    viewBox: '0 0 24 24',
    path: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'
  },
  'link': {
    viewBox: '0 0 24 24',
    path: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
  },
  'navigation-2': {
    viewBox: '0 0 24 24',
    path: '<polygon points="12 2 19 21 12 17 5 21 12 2"/>'
  },
  'sparkles': {
    viewBox: '0 0 24 24',
    path: '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/><path d="M19 3v4"/><path d="M21 5h-4"/>'
  },
  'route': {
    viewBox: '0 0 24 24',
    path: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'
  },
  'minus': {
    viewBox: '0 0 24 24',
    path: '<line x1="5" y1="12" x2="19" y2="12"/>'
  },
  'star': {
    viewBox: '0 0 24 24',
    path: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  },
  
  // Status
  'loader': {
    viewBox: '0 0 24 24',
    path: '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>'
  },
  'refresh-cw': {
    viewBox: '0 0 24 24',
    path: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 0 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 0-6.74 2.74L3 16"/><path d="M8 16H3v5"/>'
  },
  'external-link': {
    viewBox: '0 0 24 24',
    path: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="9" x2="21" y2="9"/>'
  },
  'copy': {
    viewBox: '0 0 24 24',
    path: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  },
  
  // Special
  'flag': {
    viewBox: '0 0 24 24',
    path: '<path d="M4 2v20"/><path d="M4 3h14l-3.5 4 3.5 4H4z"/>'
  },
  'globe': {
    viewBox: '0 0 24 24',
    path: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
  }
}

const icon = computed(() => icons[props.name])

const viewBox = computed(() => icon.value?.viewBox || '0 0 24 24')
const iconPath = computed(() => icon.value?.path || '')
</script>