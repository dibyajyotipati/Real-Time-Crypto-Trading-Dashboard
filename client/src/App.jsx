import { useEffect, useState } from "react";

function App() {
  const [price, setPrice] = useState("Loading...");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onmessage = (event) => {
      setPrice(event.data);
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Crypto Dashboard</h1>

      <div className="p-4 shadow bg-white rounded-lg w-64">
        <h2 className="font-bold text-lg">BTC / USDT Price:</h2>
        <p className="text-green-600 text-2xl">{price}</p>
      </div>
    </div>
  );
}

export default App;
