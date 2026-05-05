import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true,
    allowedHosts: ["miniputkwink.com", "www.miniputkwink.com"]
  },

  preview: {
    host: true,
    allowedHosts: ["miniputkwink.com", "www.miniputkwink.com"]
  }
});