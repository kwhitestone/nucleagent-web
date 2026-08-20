<script setup lang="ts">
/**
 * 侧栏 —— 对齐 design/nucleagent-design.html 第 1663–1730 行。
 *
 * 结构：品牌区（渐变 logo + 轨道圆点）/ 工作区四项导航 / 最近对话 / 用户区。
 *
 * 对话历史来自 shell store，由 core 子应用通过 postMessage 推送；
 * 侧栏不自己发请求（所有权在 core，见 store/shell.ts 顶部注释）。
 *
 * 无限滚动：.sidebar-nav 是唯一滚动容器，滚动接近底部时 requestLoadMore()
 * → MicroAppHost postMessage(loadMore) → core 拉下一页 → 推回新列表。
 */
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NAV_ITEMS } from "@/config";
import { useShellStore } from "@/store/shell";

const route = useRoute();
const router = useRouter();
const shell = useShellStore();

/** 滚动容器引用（历史列表自身），用于判定是否接近底部。 */
const navRef = ref<HTMLElement | null>(null);

/** 当前高亮项：按 path 精确匹配，根路径单独处理避免被前缀匹配吞掉。 */
/** 当前高亮项：按 path 前缀匹配；默认（含 / 和 /c/:id）高亮「对话」。 */
const activeKey = computed(() => {
  const path = route.path;
  const hit = NAV_ITEMS.find((i) => path.startsWith(i.path));
  return hit?.key ?? "chat";
});

function go(path: string): void {
  router.push(path);
}

function openConversation(id: number): void {
  router.push(`/chat/${id}`);
}

/** 滚动接近底部（32px 阈值）时请求加载下一页。幂等守卫在 store.requestLoadMore。 */
function onScroll(e: Event): void {
  const el = e.target as HTMLElement;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 32) {
    shell.requestLoadMore();
  }
}

/**
 * 视口装不满时的兜底加载：当列表不产生滚动条（scrollHeight <= clientHeight）
 * 但 hasMore 仍为真时，onScroll 永远不会触发——用户没有任何手段看到更多，
 * 必须持续补页直到出现滚动条（无限滚动自续的前提）。总量设上限 200 条
 * 防极端场景连环打满服务端；正常场景只需补 1-3 页就出滚动条，之后全部
 * 由用户滚动触发。
 */
const FILL_MAX_ITEMS = 200;

function maybeFillViewport(): void {
  void nextTick(() => {
    const el = navRef.value;
    if (!el) return;
    // 没有滚动条 + 还有更多 + 不在加载中 + 未超上限 → 继续拉下一页。
    if (
      el.scrollHeight <= el.clientHeight &&
      shell.conversations.length < FILL_MAX_ITEMS
    ) {
      shell.requestLoadMore();
    }
  });
}

// 列表或加载态变化时检查是否需要兜底加载。
watch(
  () => [shell.conversations.length, shell.loadingMore, shell.hasMore] as const,
  () => {
    if (shell.hasMore && shell.conversations.length) maybeFillViewport();
  },
);
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': shell.sidebarCollapsed }">
    <div class="sidebar-brand">
      <div class="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
          <path d="M12 22V12" />
          <path d="M4 7l8 5 8-5" />
        </svg>
      </div>
      <div class="brand-text">Nucle<span>Agent</span></div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">工作区</div>
      <div
        v-for="item in NAV_ITEMS"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        @click="go(item.path)"
      >
        <svg v-if="item.key === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        <svg v-else-if="item.key === 'creation'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
        <svg v-else-if="item.key === 'tasks'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
        <!-- providers：滑块图标（配置语义） -->
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
        <span>{{ item.label }}</span>
      </div>

      <!-- 历史列表是独立滚动容器：空间不足时只有它收缩/滚动，
           工作区导航和条目本身的大小位置保持不变。滚动监听也挂在这里——
           nav 是 overflow:hidden 永远不滚，scroll 事件又不冒泡，
           挂在 nav 上无限滚动永远不会触发（之前只加载一页的根因）。 -->
      <div class="nav-section-label">最近</div>
      <div class="sidebar-history" ref="navRef" @scroll="onScroll">
        <div
          v-for="c in shell.conversations"
          :key="c.id"
          class="history-item"
          :class="{ active: c.id === shell.activeConversationId }"
          :title="c.title"
          @click="openConversation(c.id)"
        >
          <span class="dot" />
          <span>{{ c.title }}</span>
        </div>
        <!-- 空态：未登录 / 还没有对话。不放假数据，避免看起来像有内容却点不动。 -->
        <div v-if="!shell.conversations.length" class="history-empty">
          {{ shell.isAuthenticated ? "还没有对话" : "登录后查看历史" }}
        </div>
        <!-- 加载更多态：正在拉下一页。 -->
        <div v-else-if="shell.loadingMore" class="history-status">加载中…</div>
        <!-- 到底提示：确认还有过对话且没有更多了。 -->
        <div v-else-if="!shell.hasMore" class="history-status">没有更多了</div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-chip" @click="shell.isAuthenticated ? shell.logout() : shell.openLoginModal()">
        <div class="user-avatar">{{ shell.avatarLetter }}</div>
        <div class="user-info">
          <div class="user-name">{{ shell.displayName || "未登录" }}</div>
          <div class="user-plan">{{ shell.isAuthenticated ? "Pro Plan" : "点击登录" }}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* 以下样式逐条对齐设计稿第 237–495 行。 */
.sidebar {
  width: var(--sidebar-w);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s var(--ease);
  position: relative;
  z-index: 30;
  animation: slide-in-left 0.4s var(--ease-out) both;
}

/* 折叠态：设计稿的 toggleSidebar 只改宽度；这里同时隐藏文字避免挤压换行。 */
.sidebar--collapsed { width: var(--sidebar-collapsed-w); }
.sidebar--collapsed .brand-text,
.sidebar--collapsed .nav-section-label,
.sidebar--collapsed .nav-item span,
.sidebar--collapsed .sidebar-history,
.sidebar--collapsed .user-info,
.sidebar--collapsed .user-chip > svg { display: none; }

/* 窄窗响应式：≤1024px 自动折叠为图标栏（64px），避免固定 264px 在小窗口
   占掉约 1/3 屏宽。规则与 .sidebar--collapsed 折叠态一致，但不改 store
   状态——宽屏下手动展开/折叠行为不受影响。 */
@media (max-width: 1024px) {
  .sidebar { width: var(--sidebar-collapsed-w); }
  .brand-text,
  .nav-section-label,
  .nav-item span,
  .sidebar-history,
  .user-info,
  .user-chip > svg { display: none; }
}

/* 右缘流动极光条 */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 2px;
  height: 100%;
  background: var(--grad-aurora);
  background-size: 100% 200%;
  animation: gradient-flow 4s var(--ease) infinite;
  opacity: 0.6;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  height: var(--topbar-h);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: var(--r-md);
  background: var(--grad-brand);
  background-size: 200% 200%;
  animation: gradient-flow 5s var(--ease) infinite, float 4s var(--ease) infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-glow-teal);
  position: relative;
}

/* logo 上的轨道圆点 */
.brand-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--violet-400);
  animation: orbit 4s linear infinite;
  box-shadow: 0 0 6px var(--violet-400);
}

.brand-mark svg { width: 18px; height: 18px; position: relative; z-index: 1; }

.brand-text {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: -0.3px;
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  /* 导航区不再整体滚动：高度不足时由 .sidebar-history 收缩滚动，
     工作区导航固定可见，元素大小位置不变。 */
  overflow: hidden;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
}

.nav-section-label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  padding: 12px 12px 6px;
}

/* 第二个区块标题（最近）：矮窗口下与上方导航项拉开距离。 */
.sidebar-nav .nav-section-label:nth-of-type(2) { margin-top: 14px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--r-md);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s var(--ease);
  position: relative;
  overflow: hidden;
}

/* hover 渐变光晕 */
.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--grad-teal-indigo);
  opacity: 0;
  transition: opacity 0.2s var(--ease);
  border-radius: inherit;
}

.nav-item:hover { color: var(--text-primary); transform: translateX(3px); }
.nav-item:hover::before { opacity: 0.05; }

.nav-item.active { background: var(--grad-brand-soft); color: var(--indigo-600); }
.nav-item.active::before { opacity: 0.08; }

/* 左缘高亮条 */
.nav-item.active::after {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 2px 2px 0;
  background: var(--grad-teal-indigo);
  box-shadow: 0 0 8px rgba(20, 184, 166, 0.5);
}

.nav-item > * { position: relative; z-index: 1; }

.nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.8;
  transition: transform 0.2s var(--ease);
}

.nav-item:hover svg { transform: scale(1.15); }

/* 「最近」区块与上方导航拉开距离：窄高窗口下两个区块原本贴在一起显得拥挤。
   间距规则见下方 .nav-section-label:nth-of-type(2)。 */

.sidebar-history {
  padding: 0 12px;
  /* 行距：条目之间留 2px 呼吸感，矮窗口下不再一根根紧贴。 */
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* 高度不足时收缩并自己滚动：工作区导航保持原位原尺寸，
     只有历史区被压缩。0 以下 min-height 让 flex 收缩生效。 */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 关键修复：flex 子项默认 flex-shrink:1，即使容器 overflow-y:auto，
   条目仍会先被压扁而不出滚动条。禁掉 shrink——空间不够出滚动条，
   条目大小位置不变。min-height 保住单行高度不被压缩。 */
.sidebar-history > * { flex-shrink: 0; }
.history-item { flex-shrink: 0; min-height: 34px; }

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: var(--r-md);
  cursor: pointer;
  font-size: 12.5px;
  color: var(--text-secondary);
  transition: all 0.2s var(--ease);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.history-item:hover { background: var(--bg-hover); color: var(--text-primary); transform: translateX(2px); }

/* 选中态：底色高亮 + 左侧高亮条 + 入场动效（与 nav-item.active 一致）*/
.history-item.active {
  background: var(--grad-brand-soft);
  color: var(--indigo-600);
  font-weight: 600;
  animation: fade-in-up 0.3s var(--ease-out) both;
}

.history-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  border-radius: 0 2px 2px 0;
  background: var(--grad-teal-indigo);
  box-shadow: 0 0 8px rgba(20, 184, 166, 0.5);
}

.history-item > span:last-child { overflow: hidden; text-overflow: ellipsis; }

.history-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--slate-300);
  flex-shrink: 0;
  transition: all 0.2s var(--ease);
}

.history-item:hover .dot { background: var(--teal-400); box-shadow: 0 0 6px var(--teal-400); }

.history-item.active .dot {
  background: var(--teal-500);
  box-shadow: 0 0 8px var(--teal-500);
  animation: pulse-glow 2s var(--ease) infinite;
}

.history-empty { padding: 7px 12px; font-size: 12.5px; color: var(--text-tertiary); }

/* 加载更多 / 到底提示：与空态同体量，弱化颜色避免抢视觉。 */
.history-status {
  padding: 7px 12px;
  font-size: 11.5px;
  color: var(--text-tertiary);
  text-align: center;
}

.sidebar-footer { padding: 12px; border-top: 1px solid var(--border); flex-shrink: 0; }

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.user-chip:hover { background: var(--bg-hover); transform: translateX(2px); }

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--r-full);
  background: var(--grad-teal-indigo);
  background-size: 200% 200%;
  animation: gradient-flow 6s var(--ease) infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: var(--shadow-glow-indigo);
}

.user-info { flex: 1; min-width: 0; }
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-plan { font-size: 11px; color: var(--amber-600); font-weight: 600; }
.user-chip > svg { width: 16px; height: 16px; color: var(--text-tertiary); flex-shrink: 0; }
</style>
