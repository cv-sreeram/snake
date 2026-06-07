import { useCallback, useEffect, useRef, useState } from 'react';

const FRAME_BUFFER_SIZE = 60; // ~1 second of history at 60fps
const JANK_THRESHOLD_MS = 16.7; // 60fps target
const METRICS_UPDATE_INTERVAL = 50; // Update metrics every 50ms for better responsiveness

export type PerformanceMetrics = {
  currentFrameTime: number; // milliseconds
  avgFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  jankyPercentage: number;
  fps: number;
  estimatedLayoutCost: number; // milliseconds
};

type FrameData = {
  deltaTime: number;
  isJanky: boolean;
  layoutCost: number;
};

export function usePerformanceMetrics() {
  const frameBufferRef = useRef<FrameData[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const layoutCostRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics>({
    currentFrameTime: 0,
    avgFrameTime: 0,
    minFrameTime: 0,
    maxFrameTime: 0,
    jankyPercentage: 0,
    fps: 0,
    estimatedLayoutCost: 0,
  });

  // Trigger re-renders periodically to display updated metrics
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRenderTrigger((prev) => prev + 1);
    }, METRICS_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = useCallback(() => {
    const buffer = frameBufferRef.current;
    if (buffer.length === 0) {
      return;
    }

    const frameTimes = buffer.map((f) => f.deltaTime).filter((t) => t > 0);
    if (frameTimes.length === 0) {
      return;
    }

    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const minFrameTime = Math.min(...frameTimes);
    const maxFrameTime = Math.max(...frameTimes);
    
    const jankyFrameCount = buffer.filter((f) => f.isJanky && f.deltaTime > 0).length;
    const validFrameCount = frameTimes.length;
    const jankyPercentage = validFrameCount > 0 
      ? Math.round((jankyFrameCount / validFrameCount) * 100)
      : 0;
    
    const fps = avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;
    const estimatedLayoutCost = buffer.length > 0
      ? buffer.reduce((sum, f) => sum + f.layoutCost, 0) / buffer.length
      : 0;

    metricsRef.current = {
      currentFrameTime: frameTimes[frameTimes.length - 1] || 0,
      avgFrameTime,
      minFrameTime,
      maxFrameTime,
      jankyPercentage,
      fps,
      estimatedLayoutCost,
    };
  }, []);

  const recordFrame = useCallback((now: number, layoutCost: number = 0) => {
    const deltaTime = Math.max(0, now - lastFrameTimeRef.current);
    lastFrameTimeRef.current = now;

    if (deltaTime > 0) {
      const isJanky = deltaTime > JANK_THRESHOLD_MS;
      const frameData: FrameData = {
        deltaTime,
        isJanky,
        layoutCost,
      };

      // Add to circular buffer
      const buffer = frameBufferRef.current;
      if (buffer.length >= FRAME_BUFFER_SIZE) {
        buffer.shift();
      }
      buffer.push(frameData);

      // Update metrics calculation on every frame
      updateMetrics();
    }
  }, [updateMetrics]);

  const recordLayoutCost = useCallback((cost: number) => {
    layoutCostRef.current += cost;
  }, []);

  const getAndResetLayoutCost = useCallback(() => {
    const cost = layoutCostRef.current;
    layoutCostRef.current = 0;
    return cost;
  }, []);

  // Return metrics with render trigger to ensure UI updates
  return {
    metrics: { ...metricsRef.current },
    _renderTrigger: renderTrigger,
    recordFrame,
    recordLayoutCost,
    getAndResetLayoutCost,
  };
}
