/**
 * 主壳配置：子应用来源 + 后端来源 + 导航结构。
 *
 * 端口约定（全部落在 266xx 段）：
 *   主壳 26600 | auth 26670/26678 | core 26680/26688 | executor 26690/26698
 *
 * 生产部署时由 CI 注入实际地址（同一 Nginx 不同 path，或独立域名）。
 */
function env(key: string, fallback: string): string {
  // vite 把 VITE_ 前缀的变量注入 import.meta.env；这里同时兼容运行时 window 注入
  // （便于容器里不重新构建就换后端地址）。
  const v = (import.meta.env as unknown as Record<string, string | undefined>)[key];
  if (v) return v;
  const w = (globalThis as unknown as Record<string, string | undefined>)[key];
  return w ?? fallback;
}

/** micro-app 子应用来源。 */
export const SUB_APPS = {
  core: {
    name: "core",
    url: env("VITE_CORE_WEB_URL", "http://localhost:26688/"),
  },
  auth: {
    name: "auth",
    url: env("VITE_AUTH_WEB_URL", "http://localhost:26678/"),
  },
  executor: {
    name: "executor",
    url: env("VITE_EXECUTOR_WEB_URL", "http://localhost:26698/"),
  },
} as const;

export type SubAppName = keyof typeof SUB_APPS;

/**
 * auth 后端地址。
 *
 * 壳**只**直连 auth 这一个后端——因为设计稿把登录做成了顶栏弹窗（不是独立页面），
 * 壳必须自己发登录请求。其余业务数据（对话/Agent/技能）一律由 core 子应用负责，
 * 壳通过 micro-app 数据通道接收，不重复持有一份状态。
 */
export const AUTH_API_BASE = env("VITE_AUTH_BACKEND_URL", "http://localhost:26670");

/**
 * 侧栏「工作区」导航。
 *
 * 原设计稿有「首页」，但其内容（hero + composer + 建议卡）与「对话」视图的
 * composer 功能重叠，已合并：去掉首页，「对话」成为默认入口（/ → /chat）。
 * 视图都落在 core 子应用里，靠壳路由 path 经 postMessage 告诉 core 显示哪个。
 */
export const NAV_ITEMS = [
  { key: "chat", label: "对话", path: "/chat" },
  { key: "creation", label: "创作", path: "/creation" },
  { key: "tasks", label: "任务", path: "/tasks" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** localStorage key：与三个子应用共用同一个，实现沙箱内免登录透传。 */
export const ACCESS_TOKEN_KEY = "nucleagent_access_token";
export const REFRESH_TOKEN_KEY = "nucleagent_refresh_token";
