import { defineConfig } from 'vite';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import express from 'vite-plugin-express';
import { port } from './src/server.js';

export default defineConfig({
  server: {
    port: port,
  },
  plugins: [
    express({
      middlewareFiles: 'src/routes.js',
      prefixUrl: '/',
    }),
  ],
  css: {
    postcss: {
      plugins: [
        postcssImport(),
        tailwindcss(),
      ],
    },
  },
});
