import { useEffect, useState } from "react";
import Login from "./pages/Login";
import CandleChart from "./components/CandleChart";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [prices, setPrices] = useState({
    BTCUSDT: null,
    ETHUSDT: null,
    SOLUSDT: null,
  });
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchCandles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/candle/BTCUSDT", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔴 Handle unauthorized token
        if (res.status === 401) {
          console.error("Unauthorized. Logging out.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }

        const data = await res.json();

        // 🔴 Ensure chart always gets an array
        if (Array.isArray(data)) {
          setCandles(data);
        } else {
          console.error("Invalid candle response:", data);
          setCandles([]);
        }
      } catch (err) {
        console.error("Error fetching candles:", err);
      }
    };

    fetchCandles();

    // WebSocket for live prices
    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.symbol && data.price) {
        setPrices((prev) => ({
          ...prev,
          [data.symbol]: data.price,
        }));
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close();
  }, [token]);

  if (!token) {
    return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Crypto Dashboard</h1>

      <p>BTC: {prices.BTCUSDT || "Loading..."}</p>
      <p>ETH: {prices.ETHUSDT || "Loading..."}</p>
      <p>SOL: {prices.SOLUSDT || "Loading..."}</p>

      <h2>BTC Candlestick Chart</h2>
      <CandleChart data={candles} />
    </div>
  );
}

export default App;