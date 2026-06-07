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
      <h2>Performance</h2>

      <div className="toggle-list">
        <label className="toggle" title="Press T">
          <input
            type="checkbox"
            checked={settings.useTopLeftMovement}
            onChange={onToggleTopLeftMovement}
          />
          <span className="toggle__slider" />
          <span className="toggle__label">
            <span className="toggle__key">T</span>
            top/left movement
          </span>
        </label>

        <label className="toggle" title="Press L">
          <input
            type="checkbox"
            checked={settings.forceLayoutThrashing}
            onChange={onToggleLayoutThrashing}
          />
          <span className="toggle__slider" />
          <span className="toggle__label">
            <span className="toggle__key">L</span>
            force layout thrashing
          </span>
        </label>

        <label className="toggle" title="Press S">
          <input
            type="checkbox"
            checked={!settings.useRequestAnimationFrame}
            onChange={onToggleScheduler}
          />
          <span className="toggle__slider" />
          <span className="toggle__label">
            <span className="toggle__key">S</span>
            use setInterval
          </span>
        </label>

        <label className="toggle" title="Press M">
          <input
            type="checkbox"
            checked={settings.disableMemo}
            onChange={onToggleMemo}
          />
          <span className="toggle__slider" />
          <span className="toggle__label">
            <span className="toggle__key">M</span>
            disable React.memo
          </span>
        </label>
      </div>
    </section>
  );
}
