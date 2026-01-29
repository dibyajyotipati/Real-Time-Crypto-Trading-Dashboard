import { useEffect, useState } from "react";
import Login from "./pages/Login";
import CandleChart from "./components/CandleChart";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [prices, setPrices] = useState({});
  const [candles, setCandles] = useState([]);

  // WebSocket for live prices
  useEffect(() => {
    if (!token) return;

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

    return () => ws.close();
  }, [token]);

  // Fetch candle history
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/candle/BTCUSDT", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setCandles)
      .catch(console.error);
  }, [token]);

  if (!token) {
    return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Crypto Dashboard</h1>

      <p>BTC: {prices.BTCUSDT}</p>
      <p>ETH: {prices.ETHUSDT}</p>
      <p>SOL: {prices.SOLUSDT}</p>

      <h2>BTC Candlestick Chart</h2>
      <CandleChart data={candles} />
    </div>
  );
}

export default App;
