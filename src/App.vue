<script setup lang="ts">
/**
 * 应用根 —— 对齐 design/nucleagent-design.html 的 .app-shell 结构（第 1660–2050 行）。
 *
 * 三段式：侧栏 / 主区（顶栏 + 内容）/ 登录弹窗。
 * 内容区挂 <router-view>，由 MicroAppHost 渲染对应子应用。
 *
 * 初始化时若 localStorage 里有 token，静默恢复用户信息（失败则登出，
 * 不弹框——后续 401 会自然引导到登录）。
 */
import { onMounted } from "vue";
import AppSidebar from "@/components/AppSidebar.vue";
import AppTopbar from "@/components/AppTopbar.vue";
import LoginModal from "@/components/LoginModal.vue";
import { useShellStore } from "@/store/shell";

const shell = useShellStore();

onMounted(() => {
  void shell.restore();
});
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="main-area">
      <AppTopbar />
      <div class="content">
        <router-view />
      </div>
    </main>
    <LoginModal />
  </div>
</template>

<style scoped>
/* 对齐设计稿第 225–232（app-shell）+ 500–613（main-area / content）行。 */
.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}
</style>
