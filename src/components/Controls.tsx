import type { Direction } from '../game/types';

type ControlsProps = {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDirectionChange: (direction: Direction) => void;
};

export function Controls({
  onStart,
  onPause,
  onReset,
  onDirectionChange,
}: ControlsProps) {
  return (
    <section className="panel controls">
      <h2>Game controls</h2>

      <div className="controls__row">
        <button onClick={onStart}>Start</button>
        <button onClick={onPause}>Pause</button>
        <button onClick={onReset}>Reset</button>
      </div>

      <div className="dpad" aria-label="Direction controls">
        <button className="dpad__up" onClick={() => onDirectionChange('UP')}>
          ▲
        </button>

        <button
          className="dpad__left"
          onClick={() => onDirectionChange('LEFT')}
        >
          ◀
        </button>

        <button
          className="dpad__right"
          onClick={() => onDirectionChange('RIGHT')}
        >
          ▶
        </button>

        <button
          className="dpad__down"
          onClick={() => onDirectionChange('DOWN')}
        >
          ▼
        </button>
      </div>

      <p className="hint">
        Keyboard: Arrow keys to move, Space to start, Escape to pause.
      </p>
    </section>
  );
}
