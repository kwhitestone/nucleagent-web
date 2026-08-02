// 子应用来源配置：从环境变量读取（.env 注入），默认本地 dev server。
// 生产部署时由 CI 注入实际子应用地址（同一 Nginx 不同 path，或独立域名）。
function env(key, fallback) {
    // vite 把 VITE_ 前缀的变量注入 import.meta.env；这里同时兼容运行时 window 注入。
    const v = import.meta.env[key];
    if (v)
        return v;
    const w = globalThis[key];
    return w ?? fallback;
}
export const SUB_APPS = {
    auth: {
        name: "auth",
        url: env("VITE_AUTH_WEB_URL", "http://localhost:6678"),
        title: "账户",
        icon: "👤",
        // 该子应用接管的路由前缀
        basePath: "/auth",
    },
    core: {
        name: "core",
        url: env("VITE_CORE_WEB_URL", "http://localhost:6688"),
        title: "工作台",
        icon: "✨",
        basePath: "/",
    },
    executor: {
        name: "executor",
        url: env("VITE_EXECUTOR_WEB_URL", "http://localhost:6698"),
        title: "执行器",
        icon: "⚙️",
        basePath: "/executor",
    },
};
