import { createRouter, createWebHistory } from "vue-router";
// 主壳路由：每个 path 对应一个子应用挂载点（通过 <micro-app> 加载）。
// 壳本身只负责布局 + 导航 + 认证态，业务逻辑都在子应用内。
const routes = [
    // core 子应用（工作台/对话）挂在根路径
    { path: "/", name: "core", component: () => import("@/views/SubAppCore.vue") },
    // auth 子应用（登录/注册/账户）
    { path: "/auth/:rest(.*)?", name: "auth", component: () => import("@/views/SubAppAuth.vue") },
    // executor 子应用（执行器监控）
    { path: "/executor/:rest(.*)?", name: "executor", component: () => import("@/views/SubAppExecutor.vue") },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;
