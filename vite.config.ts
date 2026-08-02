import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

// 主壳应用 dev 端口可配：
//   WEB_PORT (默认 3000)
// 子应用来源也可配（默认指向本地各子应用 dev server）：
//   AUTH_WEB_URL / CORE_WEB_URL / EXECUTOR_WEB_URL
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
