import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      // Configuración más permisiva para React
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Configuración más permisiva para el build
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Ignorar warnings específicos que pueden causar fallos
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    },
    // Continuar el build aunque haya warnings
    chunkSizeWarningLimit: 1000,
    // No fallar por warnings de TypeScript
    target: 'esnext',
    minify: false // Desactivar minificación para evitar errores
  },
  server: {
    fs: {
      strict: false, // Menos estricto para desarrollo
    },
  },
  // Configuración para manejar mejor las dependencias
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true
  },
  esbuild: {
    // Configuración permisiva para esbuild
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'commonjs-variable-in-esm': 'silent'
    }
  }
});
