import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useShellStore } from "@/store/shell";
import MicroAppHost from "@/views/MicroAppHost.vue";

/**
 * 主壳路由：4 个设计稿视图 + 两个深层子应用入口。
 *
 * 设计稿的 4 个主视图（首页/对话/创作/任务）全部由 core 子应用承载，
 * 壳路由只负责告诉 core「现在显示哪个视图」（MicroAppHost 通过 setData 下发）。
 * /account → auth 子应用，/executor → executor 子应用。
 */
const routes: RouteRecordRaw[] = [
  // 去掉首页后，「对话」是默认入口；/ 重定向到 /chat。
  { path: "/", redirect: "/chat" },
  // 工作区视图（core 子应用）
  { path: "/chat", name: "chat", component: MicroAppHost },
  { path: "/chat/:id", name: "conversation", component: MicroAppHost },
  { path: "/creation", name: "creation", component: MicroAppHost },
  { path: "/tasks", name: "tasks", component: MicroAppHost },
  // 深层子应用
  { path: "/account/:rest(.*)?", name: "account", component: MicroAppHost },
  { path: "/executor/:rest(.*)?", name: "executor", component: MicroAppHost },
  // 兜底回对话
  { path: "/:pathMatch(.*)*", redirect: "/chat" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 登录守卫：访问受保护视图时若无 token，弹登录框并停在对话页。
 * 不做强跳转（登录是 Modal，不是独立页），避免打断浏览。
 */
router.beforeEach((to) => {
  const shell = useShellStore();
  const protectedPrefixes = ["/chat", "/creation", "/tasks", "/account"];
  const needsAuth = protectedPrefixes.some((p) => to.path.startsWith(p));
  if (needsAuth && !shell.isAuthenticated) {
    shell.openLoginModal();
    return { name: "chat" };
  }
  return true;
});

export default router;
