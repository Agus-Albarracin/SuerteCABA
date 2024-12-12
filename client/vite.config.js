import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      'primereact': path.resolve(__dirname, 'node_modules/primereact'),
      'primeicons': path.resolve(__dirname, 'node_modules/primeicons'),
      'primeflex': path.resolve(__dirname, 'node_modules/primeflex')
    }
  }
});
