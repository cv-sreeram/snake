import { CSSProperties } from 'react';
import type { PerformanceMetrics } from '../hooks/usePerformanceMetrics';

type PerformanceIndicatorProps = {
  metrics: PerformanceMetrics;
};

export function PerformanceIndicator({ metrics }: PerformanceIndicatorProps) {
  const getColorByFps = (fps: number): string => {
    if (fps >= 50) return '#22c55e'; // green
    if (fps >= 30) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const getBackgroundColor = (fps: number): string => {
    if (fps >= 50) return 'rgba(34, 197, 94, 0.1)';
    if (fps >= 30) return 'rgba(234, 179, 8, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  };

  const color = getColorByFps(metrics.fps);
  const backgroundColor = getBackgroundColor(metrics.fps);
  const isJanky = metrics.currentFrameTime > 16.7;

  const indicatorStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '50px',
    padding: '4px 8px',
    backgroundColor,
    border: `2px solid ${color}`,
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color,
    lineHeight: '1.2',
    transition: 'all 0.1s ease-out',
    boxShadow: isJanky ? `0 0 6px ${color}` : 'none',
  };

  return (
    <div style={indicatorStyle}>
      <div>{metrics.fps} FPS</div>
      <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>
        {metrics.currentFrameTime.toFixed(1)}ms
      </div>
    </div>
  );
}
