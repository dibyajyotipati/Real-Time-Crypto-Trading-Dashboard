import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

export default function CandleChart({ data }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Create chart ONCE
  useEffect(() => {
    chartRef.current = createChart(containerRef.current, {
      width: 700,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      timeScale: { timeVisible: true },
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries);

    return () => chartRef.current.remove();
  }, []);

  // Update candles
  useEffect(() => {
    if (!data || data.length === 0 || !seriesRef.current) return;

    // ✅ 1. Convert + sort
    const sorted = [...data]
      .map((c) => ({
        time: Math.floor(new Date(c.timestamp).getTime() / 1000),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
      }))
      .sort((a, b) => a.time - b.time);

    // ✅ 2. Remove duplicate timestamps
    const unique = [];
    const seen = new Set();

    for (const c of sorted) {
      if (!seen.has(c.time)) {
        seen.add(c.time);
        unique.push(c);
      }
    }

    // ✅ 3. Send to chart
    seriesRef.current.setData(unique);
  }, [data]);

  return <div ref={containerRef} />;
}
