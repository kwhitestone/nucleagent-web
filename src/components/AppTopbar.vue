<script setup lang="ts">
/**
 * 顶栏 —— 对齐 design/nucleagent-design.html 第 1735–1754 行。
 * 玻璃拟态 + 三态操作按钮（ghost 反馈 / outline 下载 / primary 登录）。
 */
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useShellStore } from "@/store/shell";

const route = useRoute();
const shell = useShellStore();

/** 面包屑文本，与设计稿 switchView 的 titles 一致。 */
const breadcrumb = computed(() => {
  const p = route.path;
  if (p.startsWith("/chat")) return "对话";
  if (p.startsWith("/creation")) return "创作";
  if (p.startsWith("/tasks")) return "任务";
  if (p.startsWith("/account")) return "账户";
  if (p.startsWith("/executor")) return "执行器";
  return "首页";
});
</script>

<template>
  <header class="topbar">
    <button class="topbar-toggle" title="折叠侧栏" @click="shell.toggleSidebar()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
    <div class="topbar-title">
      NucleAgent <span class="breadcrumb">/ {{ breadcrumb }}</span>
    </div>
    <div class="topbar-spacer" />
    <button class="topbar-action ghost" title="反馈">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
      反馈
    </button>
    <button class="topbar-action outline" title="下载客户端">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
      下载客户端
    </button>
    <!-- 未登录显示「登录」，已登录显示用户名（点登出）。primary 按钮带 shimmer 扫光。 -->
    <button
      class="topbar-action primary"
      @click="shell.isAuthenticated ? shell.logout() : shell.openLoginModal()"
    >
      {{ shell.isAuthenticated ? shell.displayName : "登录" }}
    </button>
  </header>
</template>

<style scoped>
/* 对齐设计稿第 509–601 行。 */
.topbar {
  height: var(--topbar-h);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
  z-index: 20;
  animation: slide-in-right 0.4s var(--ease-out) both;
}

.topbar-toggle {
  width: 34px;
  height: 34px;
  border-radius: var(--r-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s var(--ease);
}

.topbar-toggle:hover { background: var(--bg-hover); color: var(--text-primary); transform: scale(1.05); }

.topbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.topbar-title .breadcrumb { color: var(--text-tertiary); font-weight: 400; font-size: 13px; }

.topbar-spacer { flex: 1; }

.topbar-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s var(--ease);
  border: 1px solid transparent;
  white-space: nowrap;
}

.topbar-action.ghost { color: var(--text-secondary); background: transparent; }
.topbar-action.ghost:hover { background: var(--bg-hover); color: var(--text-primary); }

.topbar-action.outline {
  color: var(--text-primary);
  background: var(--bg-card);
  border-color: var(--border);
}

.topbar-action.outline:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); transform: translateY(-1px); }

.topbar-action.primary {
  background: var(--grad-teal-indigo);
  background-size: 200% 200%;
  color: white;
  box-shadow: var(--shadow-glow-teal);
  animation: gradient-flow 5s var(--ease) infinite;
  position: relative;
  overflow: hidden;
  max-width: 140px;
  text-overflow: ellipsis;
}

/* primary 按钮的扫光高光 */
.topbar-action.primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

.topbar-action.primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-glow-indigo); }

.topbar-action svg { width: 16px; height: 16px; position: relative; z-index: 1; }
</style>
