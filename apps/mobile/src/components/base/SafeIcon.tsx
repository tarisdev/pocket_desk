import React from 'react';

interface SafeIconProps {
  component:
    | React.ComponentType<{
        size?: number;
        color?: string;
        strokeWidth?: number;
      }>
    | null
    | undefined;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function SafeIcon({
  component,
  size = 20,
  color,
  strokeWidth = 2,
}: SafeIconProps) {
  if (!component) return null;
  return React.createElement(component, { size, color, strokeWidth });
}
