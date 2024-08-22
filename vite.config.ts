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
      "@wizard": path.resolve(__dirname, "./src/wizard"),
    }
  },
} satisfies UserConfig;
