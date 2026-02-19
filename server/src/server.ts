import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// load shared root env
dotenv.config({ path: "../../.env" });

// load server-specific env
dotenv.config({ path: "./server/.env" });

const isDev = process.env.NODE_ENV !== "production";
const serverPort = isDev
  ? (process.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (process.env.VITE_SERVER_PROD_PORT ?? 8081);
const clientPort = isDev
  ? (process.env.VITE_CLIENT_DEV_PORT ?? 5173)
  : (process.env.VITE_CLIENT_PROD_PORT ?? 4173);

const app = express();

const corsOptions = {
  origin: [`http://localhost:${clientPort}`],
};

app.use(cors(corsOptions));

app.get("/api", (_req, res) => {
  res.json({ fruits: ["apple", "banana", "orange"] });
});

app.listen(serverPort, () => {
  console.log(`Server is running on http://localhost:${serverPort}`);
});
