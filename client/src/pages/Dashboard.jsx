useEffect(() => {
  const ws = new WebSocket("ws://localhost:5000/ws");

  ws.onopen = () => {
    console.log("Connected to WebSocket");
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.symbol === "BTCUSDT") {
      setBtcPrice(data.price);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket Error: ", err);
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
  };

  return () => ws.close();
}, []);
