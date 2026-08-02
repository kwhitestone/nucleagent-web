import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

// 主壳应用 dev 端口可配：
//   WEB_PORT (默认 3000)
// 子应用来源也可配（默认指向本地各子应用 dev server）：
//   VITE_AUTH_WEB_URL / VITE_CORE_WEB_URL / VITE_EXECUTOR_WEB_URL
//
// 反向代理策略（关键）：浏览器/micro-app 只同源访问主壳 :3000，
// 子应用资源经 Vite dev server 内部 proxy 转发，绕过浏览器本地代理对非标端口的拦截。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.WEB_PORT ?? env.PORT ?? 3000);
  const authUrl = env.VITE_AUTH_WEB_URL ?? "http://localhost:6678";
  const coreUrl = env.VITE_CORE_WEB_URL ?? "http://localhost:6688";
  const executorUrl = env.VITE_EXECUTOR_WEB_URL ?? "http://localhost:6698";

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
      // 子应用反向代理：浏览器同源访问 /__core /__auth /__executor，
      // Vite 内部转发到各子应用 dev server（不走浏览器代理）。
      proxy: {
        "/__core": { target: coreUrl, changeOrigin: true, rewrite: (p) => p.replace(/^\/__core/, "") },
        "/__auth": { target: authUrl, changeOrigin: true, rewrite: (p) => p.replace(/^\/__auth/, "") },
        "/__executor": { target: executorUrl, changeOrigin: true, rewrite: (p) => p.replace(/^\/__executor/, "") },
      },
    },
  };
});
