import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

// 主壳应用 dev 端口可配：
//   WEB_PORT (默认 3000)
// 子应用 URL 通过 VITE_*_WEB_URL 环境变量配置（见 .env.example），
// 子应用以 iframe 方式加载（完全隔离，不共享 window/history）。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.WEB_PORT ?? env.PORT ?? 3000);

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    server: {
      port,
      cors: true,
    },
  };
});
