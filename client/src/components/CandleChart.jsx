import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

export default function CandleChart({ data }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      width: 800,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries);

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Update data when candles change
  useEffect(() => {
    // 🔴 Prevent crash if API returns object / null / undefined
    if (!Array.isArray(data) || data.length === 0 || !seriesRef.current) return;

    const formatted = data
      .map((c) => ({
        time: Math.floor(new Date(c.timestamp).getTime() / 1000),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
      }))
      .sort((a, b) => a.time - b.time); // keep candles ordered

    seriesRef.current.setData(formatted);
  }, [data]);

  return <div ref={containerRef} />;
}