import { useEffect, useState } from "react";

function App() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5173/ws");

    ws.onopen = () => console.log("WebSocket connected!");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WS Message:", data);

        if (data.price) {
          setPrice(data.price);
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket Error:", err);
    ws.onclose = () => console.log("WebSocket closed.");

    return () => ws.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Crypto Dashboard</h1>

      <div className="p-4 shadow bg-white rounded-lg w-64">
        <h2 className="font-bold text-lg">BTC / USDT Price:</h2>
        <p className="text-green-600 text-2xl">
          {price ? `$${price}` : "Loading..."}
        </p>
      </div>
    </div>
  );
}

export default App;
