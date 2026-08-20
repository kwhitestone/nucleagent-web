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
  { path: "/providers", name: "providers", component: MicroAppHost },
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
  const protectedPrefixes = ["/chat", "/creation", "/tasks", "/providers", "/account"];
  const needsAuth = protectedPrefixes.some((p) => to.path.startsWith(p));
  if (needsAuth && !shell.isAuthenticated) {
    shell.openLoginModal();
    // 只在不在 /chat 时重定向；已在 /chat 仍 return {name:'chat'} 会构成
    // 「守卫每次都返回新 location」的死循环，router abort 后初始导航失败，
    // 路由停在 matched:[] 的 "/"——登录成功也不渲染任何视图（iframe 不挂载、
    // 侧栏无历史），刷新才恢复。
    if (to.name !== "chat") return { name: "chat" };
  }
  return true;
});

/**
 * 登录成功后恢复导航：守卫因未登录 abort 过的导航不会自动重试。
 * token 从无到有（登录）时，若当前路由没有匹配的组件（matched 为空，
 * 即初始导航被中止的残留状态），补一次 /chat 导航，让 MicroAppHost 挂载。
 */
router.afterEach(() => {
  const shell = useShellStore();
  if (shell.isAuthenticated && router.currentRoute.value.matched.length === 0) {
    void router.push("/chat");
  }
});

export default router;
