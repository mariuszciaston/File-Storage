import { useEffect, useState } from "react";

import "./App.css";

const isDev = import.meta.env.DEV;
const serverPort = isDev
  ? import.meta.env.VITE_SERVER_DEV_PORT || 8080
  : import.meta.env.VITE_SERVER_PROD_PORT || 8081;

function App() {
  const [array, setArray] = useState([]);

  useEffect(() => {
    const fetchAPI = async () => {
      const res = await fetch(`http://localhost:${serverPort}/api`);
      const data = await res.json();
      setArray(data.fruits);
      console.log(data);
    };

    fetchAPI();
  }, []);

  return (
    <>
      {array.map((fruit) => (
        <div key={fruit}>
          <p className="font-bold text-violet-500">{fruit}</p>
        </div>
      ))}
    </>
  );
}

export default App;
