import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// 主壳路由：每个 path 对应一个子应用挂载点（通过 <micro-app> 加载）。
// 壳本身只负责布局 + 导航，不做认证。
const routes: RouteRecordRaw[] = [
  // 工作台（core 子应用）
  { path: "/", name: "core", component: () => import("@/views/SubAppCore.vue") },
  // auth 子应用所有路由（登录/注册/账户）挂在 /auth 下
  { path: "/auth/:rest(.*)?", name: "auth", component: () => import("@/views/SubAppAuth.vue") },
  // 兼容 auth 子应用可能产生的 /login（独立运行遗留）→ 重定向到 /auth/login
  { path: "/login", redirect: "/auth/login" },
  { path: "/register", redirect: "/auth/register" },
  // executor 子应用
  { path: "/executor/:rest(.*)?", name: "executor", component: () => import("@/views/SubAppExecutor.vue") },
  // 兜底：所有未匹配路径回首页
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
