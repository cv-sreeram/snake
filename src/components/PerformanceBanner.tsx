import type { PerformanceSettings } from '../game/types';

type PerformanceBannerProps = {
  settings: PerformanceSettings;
};

export function PerformanceBanner({ settings }: PerformanceBannerProps) {
  const reasons = [];

  if (settings.useTopLeftMovement) {
    reasons.push({
      title: 'top/left movement is enabled',
      description:
        'Snake and food movement now updates layout properties. This can trigger layout and paint work. Transform-based movement is usually easier for the browser to composite.',
    });
  }

  if (settings.forceLayoutThrashing) {
    reasons.push({
      title: 'Forced layout thrashing is enabled',
      description:
        'The app intentionally writes layout-affecting styles and immediately reads layout values like offsetHeight. This forces synchronous layout recalculation.',
    });
  }

  if (!settings.useRequestAnimationFrame) {
    reasons.push({
      title: 'setInterval scheduling is enabled',
      description:
        'Game updates are no longer aligned with the browser paint cycle. Under load, setInterval can drift and create uneven movement.',
    });
  }

  if (settings.disableMemo) {
    reasons.push({
      title: 'React.memo is disabled',
      description:
        'Board cells re-render on every game tick even though most cells do not visually change. This increases React render work.',
    });
  }

  if (reasons.length === 0) {
    return (
      <section className="performance-banner performance-banner--healthy">
        <h2>Performance mode: optimized</h2>
        <p>
          The game is using transform-based movement, requestAnimationFrame,
          memoized board cells, and no forced layout reads.
        </p>
      </section>
    );
  }

  return (
    <section className="performance-banner performance-banner--degraded">
      <h2>Performance degraded</h2>
      <p>
        The enabled toggles are intentionally adding rendering work. Test
        multiple toggles together to see the combined impact.
      </p>

      <ul>
        {reasons.map((reason) => (
          <li key={reason.title}>
            <strong>{reason.title}:</strong> {reason.description}
          </li>
        ))}
      </ul>
    </section>
  );
}
