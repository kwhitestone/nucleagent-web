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
  // Chrome 4K 高 DPI 首帧布局竞态修复：首帧 flex 计算时视口尺寸可能尚未
  // 稳定，导致 .content > iframe height:100% 锁在错误的小尺寸（页面只占左上
  // 角，resize 后才恢复；Edge 不复现）。双层 rAF 确保首帧合成完成、DPI 校正
  // 落定后再触发重排，此时布局会用正确尺寸。对 Edge/标准 DPI 无副作用。
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  });
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
/* 对齐设计稿第 225–232（app-shell）+ 500–613（main-area / content）行。
   用 100% 而非 100vw/100vh：高分屏缩放下 vw/vh 参照的 containing block 可能
   推导异常，导致布局缩在左上角。父级 #app 已是 100%×100%（见 global.css）。 */
.app-shell {
  display: flex;
  height: 100%;
  width: 100%;
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
  /* min-height:0 是 flex 子项能被父级约束高度的关键（默认 min-height:auto
     会让内容撑开而非收缩）。配合 overflow:hidden，让 .content 固定撑满、
     不自身滚动——滚动交给内部 iframe（core/auth/executor 子应用）各自处理。
     否则刷新首帧 iframe height:100% 参照高度未定 → core 塌缩，resize 才恢复。 */
  min-height: 0;
  overflow: hidden;
  position: relative;
}
</style>
