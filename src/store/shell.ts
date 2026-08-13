/**
 * 主壳状态：登录态 + chrome 状态 + 从 core 接收的对话历史。
 *
 * 所有权约定（关键，别破坏）：
 *   - 对话历史的**所有权在 core 子应用**。壳只负责渲染侧栏，不自己拉
 *     /conversation 列表，否则同一份数据两处请求、两处缓存，必然不一致。
 *     core 通过 micro-app 的 setData 把列表推给壳，壳被动接收。
 *   - 登录态归壳（因为登录弹窗是壳的 chrome），token 落 localStorage。
 *     沙箱内同源，三个子应用直接读同一个 key，无需再传一遍。
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  clearTokens,
  fetchUserInfo,
  getAccessToken,
  login as loginApi,
  register as registerApi,
  setTokens,
  type LoginPayload,
  type RegisterPayload,
  type UserInfo,
} from "@/api/auth";

/** core 推过来的对话摘要——只取侧栏渲染需要的字段，不搬整个 Conversation。 */
export interface ConversationBrief {
  id: number;
  title: string;
  status?: string;
}

export const useShellStore = defineStore("shell", () => {
  // --- 登录态 ---
  const token = ref<string>(getAccessToken());
  const user = ref<UserInfo | null>(null);
  const isAuthenticated = computed(() => !!token.value);
  const displayName = computed(() => user.value?.nickName || user.value?.username || "");
  /** 侧栏头像首字母；未登录时给中性占位。 */
  const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase() || "N");

  // --- chrome 状态 ---
  const sidebarCollapsed = ref(false);
  const loginModalOpen = ref(false);

  // --- 由 core 子应用推送 ---
  const conversations = ref<ConversationBrief[]>([]);
  const activeConversationId = ref<number | null>(null);
  /** 还有更早的对话可加载（core 推送的 hasMore）。 */
  const hasMore = ref(true);
  /** 下一页加载中（侧栏显示加载态，并阻止重复触发）。 */
  const loadingMore = ref(false);
  /** 加载更多请求计数：自增触发 MicroAppHost watch → postMessage(loadMore) 给 core。 */
  const loadMoreRequested = ref(0);

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function openLoginModal(): void {
    loginModalOpen.value = true;
  }

  function closeLoginModal(): void {
    loginModalOpen.value = false;
  }

  /** 由 core 子应用推送——每次对话列表变化都会推一次，含是否还有更多。 */
  function setConversations(
    list: ConversationBrief[],
    activeId: number | null = null,
    more: boolean = true,
  ): void {
    conversations.value = list;
    activeConversationId.value = activeId;
    hasMore.value = more;
    // core 推回新列表即表示本轮加载完成，清掉侧栏加载态。
    loadingMore.value = false;
  }

  /**
   * 侧栏滚动到底时调用：请求 core 加载下一页。
   * 幂等守卫在此（hasMore/loadingMore），MicroAppHost 只需 watch 计数发消息。
   */
  function requestLoadMore(): void {
    if (!hasMore.value || loadingMore.value) return;
    loadingMore.value = true;
    loadMoreRequested.value++;
  }

  async function login(payload: LoginPayload): Promise<void> {
    const data = await loginApi(payload);
    setTokens(data.accessToken, data.refreshToken);
    token.value = data.accessToken;
    // 登录响应已带 user，直接用，省一次往返。
    user.value = data.user;
    loginModalOpen.value = false;
  }

  async function register(payload: RegisterPayload): Promise<void> {
    await registerApi(payload);
    // 注册接口不签发 token，注册完仍需登录一次。
    await login({ username: payload.username, password: payload.password });
  }

  /**
   * 用已存在的 token 恢复用户信息（刷新页面后调用）。
   * token 过期时静默登出——此时弹登录框会打断用户，交给后续 401 处理。
   */
  async function restore(): Promise<void> {
    if (!token.value) return;
    try {
      user.value = await fetchUserInfo();
    } catch {
      logout();
    }
  }

  function logout(): void {
    clearTokens();
    token.value = "";
    user.value = null;
    conversations.value = [];
    activeConversationId.value = null;
    hasMore.value = true;
    loadingMore.value = false;
  }

  return {
    // state
    token,
    user,
    sidebarCollapsed,
    loginModalOpen,
    conversations,
    activeConversationId,
    hasMore,
    loadingMore,
    loadMoreRequested,
    // getters
    isAuthenticated,
    displayName,
    avatarLetter,
    // actions
    toggleSidebar,
    openLoginModal,
    closeLoginModal,
    setConversations,
    requestLoadMore,
    login,
    register,
    restore,
    logout,
  };
});
