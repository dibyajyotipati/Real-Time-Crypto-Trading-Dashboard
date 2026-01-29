import { useEffect, useState } from "react";
import Login from "./pages/Login";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [price, setPrice] = useState("Loading...");

  useEffect(() => {
    if (!token) return;

    // 🔥 WebSocket instead of fetch
    const ws = new WebSocket("ws://localhost:5000/ws");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS DATA:", data);

      if (data.price) {
        setPrice(data.price);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => ws.close();
  }, [token]);

  if (!token) {
    return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Crypto Dashboard</h1>

      <div className="p-4 shadow bg-white rounded-lg w-64">
        <h2 className="font-bold text-lg">BTC / USDT Price:</h2>
        <p className="text-green-600 text-2xl">
          ${price}
        </p>
      </div>
    </div>
  );
}

export default App;
