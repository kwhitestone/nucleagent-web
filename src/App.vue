<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SUB_APPS, type SubAppName } from "@/config";

const route = useRoute();
const router = useRouter();

const navItems: { name: SubAppName; label: string; icon: string }[] = [
  { name: "core", label: "工作台", icon: SUB_APPS.core.icon },
  { name: "executor", label: "执行器", icon: SUB_APPS.executor.icon },
  { name: "auth", label: "账户", icon: SUB_APPS.auth.icon },
];

const activeName = computed<SubAppName>(() => {
  if (route.path.startsWith("/auth")) return "auth";
  if (route.path.startsWith("/executor")) return "executor";
  return "core";
});

function go(name: SubAppName) {
  const target = SUB_APPS[name];
  router.push(name === "core" ? "/" : target.basePath);
}
</script>

<template>
  <div class="shell">
    <aside class="shell__sidebar">
      <div class="shell__brand">
        <span class="shell__brand-mark">N</span>
        <span class="shell__brand-name">NucleAgent</span>
      </div>
      <nav class="shell__nav">
        <button
          v-for="item in navItems"
          :key="item.name"
          type="button"
          class="shell__nav-item"
          :class="{ 'shell__nav-item--active': activeName === item.name }"
          @click="go(item.name)"
        >
          <span class="shell__nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>
    <main class="shell__main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: var(--na-bg);
}
/* 侧栏：玻璃拟态半透明白色（对齐 design/nucleagent-design.html，非深色）*/
.shell__sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex: 0 0 240px;
  height: 100%;
  padding: 20px 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid var(--na-border);
  color: var(--na-text);
}
.shell__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 20px;
}
.shell__brand-mark {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--na-grad-brand);
  font-family: var(--na-font-display);
  font-size: 20px;
  color: #fff;
  box-shadow: var(--na-shadow-glow-teal);
}
.shell__brand-name {
  font-family: var(--na-font-display);
  font-size: 18px;
  color: var(--na-text);
}
.shell__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.shell__nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 0 12px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--na-text-secondary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s var(--ease, ease);
}
.shell__nav-item:hover {
  color: var(--na-text);
  transform: translateX(3px);
}
.shell__nav-item--active {
  background: rgba(20, 184, 166, 0.1);
  color: var(--na-accent, var(--teal-600));
  font-weight: 600;
}
.shell__nav-icon {
  font-size: 16px;
}
.shell__main {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}
</style>
