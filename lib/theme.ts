export type AccentColor = 'blue' | 'green' | 'red' | 'purple' | 'dark' | 'orange' | 'glass' | 'minimal'
export type Appearance = 'light' | 'dark' | 'system'
export type Shape = 'rounded' | 'square'
export type Density = 'normal' | 'compact'
export type SidebarMode = 'expanded' | 'collapsed'

export interface Theme {
  accent: AccentColor
  appearance: Appearance
  shape: Shape
  density: Density
  sidebar: SidebarMode
  animations: boolean
}

export const DEFAULT_THEME: Theme = {
  accent: 'green',
  appearance: 'light',
  shape: 'rounded',
  density: 'normal',
  sidebar: 'expanded',
  animations: true,
}

export const ACCENT_META: Record<AccentColor, { label: string; color: string }> = {
  blue:    { label: 'Blue',    color: '#3b82f6' },
  green:   { label: 'Green',   color: '#10b981' },
  red:     { label: 'Red',     color: '#ef4444' },
  purple:  { label: 'Purple',  color: '#a855f7' },
  dark:    { label: 'Dark',    color: '#6366f1' },
  orange:  { label: 'Orange',  color: '#f97316' },
  glass:   { label: 'Glass',   color: '#22d3ee' },
  minimal: { label: 'Minimal', color: '#94a3b8' },
}
