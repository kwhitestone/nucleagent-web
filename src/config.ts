// 子应用来源配置：从环境变量读取（.env 注入），默认本地 dev server。
// 生产部署时由 CI 注入实际子应用地址（同一 Nginx 不同 path，或独立域名）。
function env(key: string, fallback: string): string {
  // vite 把 VITE_ 前缀的变量注入 import.meta.env；这里同时兼容运行时 window 注入。
  const v = (import.meta.env as unknown as Record<string, string | undefined>)[key];
  if (v) return v;
  const w = (globalThis as unknown as Record<string, string | undefined>)[key];
  return w ?? fallback;
}

export const SUB_APPS = {
  auth: {
    name: "auth",
    // 走壳应用的 Vite 反向代理（同源 /__auth -> 子应用 dev server），
    // 绕过浏览器本地代理对非标端口的拦截（502 白屏问题）。
    url: env("VITE_AUTH_WEB_URL", "/__auth/"),
    title: "账户",
    icon: "👤",
    basePath: "/auth",
  },
  core: {
    name: "core",
    url: env("VITE_CORE_WEB_URL", "/__core/"),
    title: "工作台",
    icon: "✨",
    basePath: "/",
  },
  executor: {
    name: "executor",
    url: env("VITE_EXECUTOR_WEB_URL", "/__executor/"),
    title: "执行器",
    icon: "⚙️",
    basePath: "/executor",
  },
} as const;

export type SubAppName = keyof typeof SUB_APPS;
