import React from 'react';

export function JoystickOverlay({ active, basePos, stickPos, radius }) {
  if (!active) return null;

  const baseStyle = {
    position: 'fixed',
    left: basePos.x - radius,
    top: basePos.y - radius,
    width: radius * 2,
    height: radius * 2,
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '2px solid #333',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 999,
  };

  const stickRadius = radius / 2;

  const stickStyle = {
    position: 'fixed',
    left: stickPos.x - stickRadius,
    top: stickPos.y - stickRadius,
    width: stickRadius * 2,
    height: stickRadius * 2,
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    border: '2px solid #666',
    pointerEvents: 'none',
    zIndex: 1000,
  };

  return (
    <>
      <div style={baseStyle} />
      <div style={stickStyle} />
    </>
  );
}
