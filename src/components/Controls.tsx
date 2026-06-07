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
      <h2>Game</h2>

      <div className="controls__buttons">
        <button onClick={onStart}>Start</button>
        <button onClick={onReset}>Reset</button>
      </div>

      <div className="dpad dpad--desktop-hidden" aria-label="Direction controls">
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

      <p className="controls__hint">
        <strong>Space</strong> to play/pause • <strong>Arrows</strong> to move
      </p>
    </section>
  );
}
