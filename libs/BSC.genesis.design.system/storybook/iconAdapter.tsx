import React, { type ReactNode } from 'react';
import { setFeatherIconRenderer } from '../src/icons';

// Curated Feather icon SVG paths covering icons actually used in source components.
// Paths are from the Feather icon set (MIT licensed, https://feathericons.com).
const FEATHER_PATHS: Record<string, string> = {
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-up': 'M18 15l-6-6-6 6',
  'check': 'M20 6L9 17l-5-5',
  'x': 'M18 6L6 18M6 6l12 12',
  'alert-circle': 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4M12 16h.01',
  'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  'info': 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'user': 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z',
  'bell': 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  'menu': 'M3 12h18M3 6h18M3 18h18',
  'user-plus': 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM20 8v6M23 11h-6',
  'copy': 'M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  'eye': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  'eye-off': 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22',
  'search': 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  'calendar': 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18',
  'lock': 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  'clock': 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
  'message-circle': 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
};

function FeatherSvgIcon({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }): ReactNode {
  const d = FEATHER_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Install the renderer for storybook context.
setFeatherIconRenderer(({ name, size, color }) =>
  <FeatherSvgIcon name={name} size={size ?? 24} color={color ?? '#000'} />
);

export function FeatherIconProvider({ children }: { children: ReactNode }) {
  // Re-install on mount to ensure the renderer is active in storybook.
  setFeatherIconRenderer(({ name, size, color }) =>
    <FeatherSvgIcon name={name} size={size ?? 24} color={color ?? '#000'} />
  );
  return <>{children}</>;
}
