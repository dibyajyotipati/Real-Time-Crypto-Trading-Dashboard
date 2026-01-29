import { useEffect, useState } from "react";
import Login from "./pages/Login";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [prices, setPrices] = useState({
    BTCUSDT: "Loading...",
    ETHUSDT: "Loading...",
    SOLUSDT: "Loading..."
  });

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS DATA:", data);

      // ✅ update only that coin
      if (data.symbol && data.price) {
        setPrices((prev) => ({
          ...prev,
          [data.symbol]: data.price
        }));
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [token]);

  if (!token) {
    return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Crypto Dashboard</h1>

      <div>
        <h2>BTC / USDT</h2>
        <p>{prices.BTCUSDT}</p>

        <h2>ETH / USDT</h2>
        <p>{prices.ETHUSDT}</p>

        <h2>SOL / USDT</h2>
        <p>{prices.SOLUSDT}</p>
      </div>
    </div>
  );
}

export default App;
