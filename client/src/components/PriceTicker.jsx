import { useEffect, useState } from "react";

export default function PriceTicker() {
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000"); // backend websocket port

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol === "BTCUSDT") {
        setBtcPrice(data.price);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, []);

  return (
    <div className="p-6 bg-white shadow-md rounded-md mt-6 w-fit">
      <h2 className="text-xl font-bold text-gray-800">BTC / USDT Price:</h2>
      <p className="text-3xl font-semibold text-green-600 mt-2">
        {btcPrice ? `$${btcPrice}` : "Loading..."}
      </p>
    </div>
  );
}
