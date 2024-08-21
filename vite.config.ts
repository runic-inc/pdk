import path from 'path';
import { type UserConfig } from "vite";

export default {
  root: 'src/wizard',
  build: {
    outDir: path.resolve(__dirname, 'dist/wizard'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      react: "hono/jsx/dom",
      "react-dom": "hono/jsx/dom"
    }
  },
} satisfies UserConfig;
