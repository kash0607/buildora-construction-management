import React from 'react';
import RadialPulseLoader from '../ui/loading-animation';

/**
 * PageLoader
 * Standard Buildora unified loader component featuring RadialPulseLoader
 */
export default function PageLoader({
  text = 'Loading...',
  subtext,
  size = 140,
  color = '#B98958',
  minHeight = '55vh',
  className = ''
}) {
  return (
    <div
      className={`dashboard-page-loader-wrapper ${className}`.trim()}
      style={{ minHeight }}
    >
      <RadialPulseLoader
        size={size}
        color={color}
        text={text}
        subtext={subtext}
        showText={true}
      />
    </div>
  );
}
