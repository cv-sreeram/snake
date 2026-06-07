import { CSSProperties } from 'react';
import type { PerformanceMetrics } from '../hooks/usePerformanceMetrics';

type DetailedStatsPanelProps = {
  metrics: PerformanceMetrics;
  isOpen: boolean;
  onClose: () => void;
};

export function DetailedStatsPanel({
  metrics,
  isOpen,
  onClose,
}: DetailedStatsPanelProps) {
  if (!isOpen) {
    return null;
  }

  const statRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '12px',
  };

  const labelStyle: CSSProperties = {
    fontWeight: '500',
    opacity: 0.8,
  };

  const valueStyle: CSSProperties = {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#22c55e',
  };

  const getValueColor = (
    value: number,
    good: number,
    bad: number
  ): string => {
    if (value <= good) return '#22c55e'; // green
    if (value <= bad) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const panelStyle: CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '280px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 1000,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid rgba(148, 163, 184, 0.3)',
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  };

  const jankyColor = getValueColor(metrics.jankyPercentage, 10, 25);
  const frameTimeColor = getValueColor(metrics.avgFrameTime, 16.7, 25);

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
          Performance Stats
        </h3>
        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.color = '#cbd5e1';
            }
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.color = '#94a3b8';
            }
          }}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div style={statRowStyle}>
        <span style={labelStyle}>FPS</span>
        <span style={{ ...valueStyle, color: getValueColor(metrics.fps, 50, 30) }}>
          {metrics.fps} fps
        </span>
      </div>

      <div style={statRowStyle}>
        <span style={labelStyle}>Current Frame</span>
        <span style={{ ...valueStyle, color: frameTimeColor }}>
          {metrics.currentFrameTime.toFixed(2)} ms
        </span>
      </div>

      <div style={statRowStyle}>
        <span style={labelStyle}>Avg Frame Time</span>
        <span style={{ ...valueStyle, color: frameTimeColor }}>
          {metrics.avgFrameTime.toFixed(2)} ms
        </span>
      </div>

      <div style={statRowStyle}>
        <span style={labelStyle}>Min Frame Time</span>
        <span style={valueStyle}>{metrics.minFrameTime.toFixed(2)} ms</span>
      </div>

      <div style={statRowStyle}>
        <span style={labelStyle}>Max Frame Time</span>
        <span style={{ ...valueStyle, color: getValueColor(metrics.maxFrameTime, 20, 30) }}>
          {metrics.maxFrameTime.toFixed(2)} ms
        </span>
      </div>

      <div style={statRowStyle}>
        <span style={labelStyle}>Jank Percentage</span>
        <span style={{ ...valueStyle, color: jankyColor }}>
          {metrics.jankyPercentage}%
        </span>
      </div>

      <div style={{ ...statRowStyle, borderBottom: 'none' }}>
        <span style={labelStyle}>Est. Layout Cost</span>
        <span style={{ ...valueStyle, color: getValueColor(metrics.estimatedLayoutCost, 5, 10) }}>
          {metrics.estimatedLayoutCost.toFixed(2)} ms
        </span>
      </div>

      <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.6 }}>
        Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '2px' }}>P</kbd> to close
      </div>
    </div>
  );
}
