import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable minification with esbuild (faster and included)
    minify: 'esbuild',
    // Chunk size warnings - set higher since we're splitting
    chunkSizeWarningLimit: 600,
    // Rollup options for manual code splitting
    rollupOptions: {
      output: {
        // Aggressive code splitting
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react-dom/')) {
              return 'react-dom';
            }
            if (id.includes('react-router-dom')) {
              return 'react-router';
            }
            if (id.includes('react/')) {
              return 'react';
            }
            // UI libraries
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            // Form handling & validation
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            // UI utilities
            if (id.includes('class-variance-authority') ||
                id.includes('clsx') ||
                id.includes('tailwind-merge')) {
              return 'ui-utils';
            }
            // Dates & utilities
            if (id.includes('date-fns')) {
              return 'dates';
            }
          }
        },
      },
    },
    // Source maps disabled for production (save ~30%)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Reporting compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
    ],
  },
});
