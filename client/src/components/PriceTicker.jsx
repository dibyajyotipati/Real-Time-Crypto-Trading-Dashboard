import { useEffect, useState } from "react";

export default function PriceTicker() {
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onopen = () => console.log("WebSocket Connected");

    ws.onmessage = (msg) => {
      console.log("msg:", msg.data);
      try {
        const data = JSON.parse(msg.data);

        if (data.symbol === "BTCUSDT") {
          setBtcPrice(Number(data.price).toFixed(2));
        }
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket Error:", err);
    
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
