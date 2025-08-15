// vite.config.ts
import { defineConfig } from "file:///mnt/d/1.%20LUCCAS/aplicativos%20ai/adega/solid-foundation-adega-manager/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/d/1.%20LUCCAS/aplicativos%20ai/adega/solid-foundation-adega-manager/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///mnt/d/1.%20LUCCAS/aplicativos%20ai/adega/solid-foundation-adega-manager/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/mnt/d/1. LUCCAS/aplicativos ai/adega/solid-foundation-adega-manager";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  optimizeDeps: {
    include: ["simplex-noise"],
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries - bibliotecas de terceiros
          vendor: ["react", "react-dom", "react-router-dom"],
          // Chart libraries - bibliotecas de gráficos
          charts: ["recharts"],
          // UI libraries - bibliotecas de interface
          ui: [
            "lucide-react",
            "@radix-ui/react-accordion",
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-switch",
            "@radix-ui/react-toast"
          ],
          // Supabase and data libraries - bibliotecas de dados
          supabase: ["@supabase/supabase-js", "@tanstack/react-query"],
          // Utils and helpers - utilitários
          utils: ["date-fns", "clsx", "tailwind-merge"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2QvMS4gTFVDQ0FTL2FwbGljYXRpdm9zIGFpL2FkZWdhL3NvbGlkLWZvdW5kYXRpb24tYWRlZ2EtbWFuYWdlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9kLzEuIExVQ0NBUy9hcGxpY2F0aXZvcyBhaS9hZGVnYS9zb2xpZC1mb3VuZGF0aW9uLWFkZWdhLW1hbmFnZXIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9kLzEuJTIwTFVDQ0FTL2FwbGljYXRpdm9zJTIwYWkvYWRlZ2Evc29saWQtZm91bmRhdGlvbi1hZGVnYS1tYW5hZ2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFsnc2ltcGxleC1ub2lzZSddLFxyXG4gICAgZm9yY2U6IHRydWVcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gVmVuZG9yIGxpYnJhcmllcyAtIGJpYmxpb3RlY2FzIGRlIHRlcmNlaXJvc1xyXG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICAvLyBDaGFydCBsaWJyYXJpZXMgLSBiaWJsaW90ZWNhcyBkZSBnclx1MDBFMWZpY29zXHJcbiAgICAgICAgICBjaGFydHM6IFsncmVjaGFydHMnXSxcclxuICAgICAgICAgIC8vIFVJIGxpYnJhcmllcyAtIGJpYmxpb3RlY2FzIGRlIGludGVyZmFjZVxyXG4gICAgICAgICAgdWk6IFtcclxuICAgICAgICAgICAgJ2x1Y2lkZS1yZWFjdCcsIFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvbicsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtYXZhdGFyJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXBvcG92ZXInLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VwYXJhdG9yJyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zd2l0Y2gnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0J1xyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIC8vIFN1cGFiYXNlIGFuZCBkYXRhIGxpYnJhcmllcyAtIGJpYmxpb3RlY2FzIGRlIGRhZG9zXHJcbiAgICAgICAgICBzdXBhYmFzZTogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnLCAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXHJcbiAgICAgICAgICAvLyBVdGlscyBhbmQgaGVscGVycyAtIHV0aWxpdFx1MDBFMXJpb3NcclxuICAgICAgICAgIHV0aWxzOiBbJ2RhdGUtZm5zJywgJ2Nsc3gnLCAndGFpbHdpbmQtbWVyZ2UnXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrWSxTQUFTLG9CQUFvQjtBQUMvWixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsZUFBZTtBQUFBLElBQ3pCLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLFFBQVEsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUVqRCxRQUFRLENBQUMsVUFBVTtBQUFBO0FBQUEsVUFFbkIsSUFBSTtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUE7QUFBQSxVQUVBLFVBQVUsQ0FBQyx5QkFBeUIsdUJBQXVCO0FBQUE7QUFBQSxVQUUzRCxPQUFPLENBQUMsWUFBWSxRQUFRLGdCQUFnQjtBQUFBLFFBQzlDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
