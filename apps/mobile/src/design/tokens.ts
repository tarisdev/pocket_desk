export const Colors = {
  light: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: '#eef2ff',
    secondary: '#ec4899',
    accent: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    success: '#22c55e',
    surface: '#ffffff',
    surfaceElevated: '#fafafa',
    surfaceOverlay: '#f8fafc',
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    backgroundTertiary: '#e2e8f0',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    textOnPrimary: '#ffffff',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowColorStrong: 'rgba(15, 23, 42, 0.15)',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    overlay: 'rgba(15, 23, 42, 0.4)',
    focusRing: '#6366f1',
    divider: '#e2e8f0',
    skeletonBase: '#e2e8f0',
    skeletonHighlight: '#f1f5f9',
  },
  dark: {
    primary: '#818cf8',
    primaryHover: '#a5b4fc',
    primaryLight: '#1e1b4b',
    secondary: '#f472b6',
    accent: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    success: '#4ade80',
    surface: '#1e293b',
    surfaceElevated: '#263043',
    surfaceOverlay: '#0f172a',
    background: '#08101f',
    backgroundSecondary: '#0f172a',
    backgroundTertiary: '#1e293b',
    border: '#334155',
    borderStrong: '#475569',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    textInverse: '#0f172a',
    textOnPrimary: '#0f172a',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    focusRing: '#818cf8',
    divider: '#334155',
    skeletonBase: '#1e293b',
    skeletonHighlight: '#334155',
  },
};
export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  button: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  mono: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  monoLarge: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  monoDisplay: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 44,
    fontFamily: 'monospace',
  },
};

export const Shadows = {
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0,
  },
};

export const Animation = {
  duration: {
    instant: 0,
    fast: 120,
    normal: 200,
    slow: 300,
    slower: 400,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: { damping: 15, stiffness: 150 },
    springSoft: { damping: 20, stiffness: 120 },
  },
};

export const Breakpoints = {
  sm: 375,
  md: 500,
  lg: 768,
  xl: 1024,
};

export const TouchTarget = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

export const ZIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
};

export const IconSize = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
  xxl: 40,
};

export const Layout = {
  headerHeight: 56,
  tabBarHeight: 52,
  sidebarWidth: 280,
  maxContentWidth: 1200,
  screenPadding: 16,
  cardPadding: 16,
  sectionGap: 24,
  widgetGap: 12,
};

export type ColorTokens = typeof Colors.light;
export type ColorScheme = 'light' | 'dark' | 'system';
