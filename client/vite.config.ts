import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");

  return {
    envDir: "../",
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
    ],
    preview: {
      port: Number(env.VITE_CLIENT_PROD_PORT) || 4173,
    },
    server: {
      port: Number(env.VITE_CLIENT_DEV_PORT) || 5173,
    },
  };
});
