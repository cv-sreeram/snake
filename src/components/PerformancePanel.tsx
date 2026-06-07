import type { PerformanceSettings } from '../game/types';

type PerformancePanelProps = {
  settings: PerformanceSettings;
  onToggleTopLeftMovement: () => void;
  onToggleLayoutThrashing: () => void;
  onToggleScheduler: () => void;
  onToggleMemo: () => void;
};

export function PerformancePanel({
  settings,
  onToggleTopLeftMovement,
  onToggleLayoutThrashing,
  onToggleScheduler,
  onToggleMemo,
}: PerformancePanelProps) {
  return (
    <section className="panel perf-panel">
      <h2>Performance toggles</h2>

      <div className="toggle-list">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.useTopLeftMovement}
            onChange={onToggleTopLeftMovement}
          />
          <span className="toggle__slider" />
          <span>
            Use <strong>top/left</strong> instead of{' '}
            <strong>transform</strong>
          </span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.forceLayoutThrashing}
            onChange={onToggleLayoutThrashing}
          />
          <span className="toggle__slider" />
          <span>
            Enable <strong>forced layout thrashing</strong>
          </span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={!settings.useRequestAnimationFrame}
            onChange={onToggleScheduler}
          />
          <span className="toggle__slider" />
          <span>
            Use <strong>setInterval</strong> instead of{' '}
            <strong>requestAnimationFrame</strong>
          </span>
        </label>

        <label className="toggle toggle--secondary">
          <input
            type="checkbox"
            checked={settings.disableMemo}
            onChange={onToggleMemo}
          />
          <span className="toggle__slider" />
          <span>
            Disable <strong>React.memo</strong> for board cells
          </span>
        </label>
      </div>
    </section>
  );
}
