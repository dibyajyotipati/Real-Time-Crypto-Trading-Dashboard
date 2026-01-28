import { useEffect, useState } from "react";
import Login from "./pages/Login";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [price, setPrice] = useState("Loading...");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/price/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPrice(data.price))
      .catch(() => setPrice("Error"));
  }, [token]);

  if (!token) {
    return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Crypto Dashboard</h1>

      <div className="p-4 shadow bg-white rounded-lg w-64">
        <h2 className="font-bold text-lg">BTC / USDT Price:</h2>
        <p className="text-green-600 text-2xl">${price}</p>
      </div>
    </div>
  );
}

export default App;
