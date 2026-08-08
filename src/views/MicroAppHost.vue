<script setup lang="ts">
/**
 * 子应用挂载点 —— 用 iframe 而非 micro-app。
 *
 * 为什么放弃 micro-app：
 *   micro-app 沙箱用 new Function 执行子应用 JS，无法处理 Vite ESM 的 import
 *   语句（报 "Cannot use import statement outside a module"）。inline 模式可
 *   让脚本作为 module 注入，但 rc.32 下 inline + 任意属性组合都会导致子应用
 *   破坏宿主全局（壳的 Vue 都挂不上）。这是 micro-app 与 Vite ESM 的已知根本
 *   冲突，无稳定配置。
 *
 * iframe 方案：
 *   - ESM 原生支持，零配置，子应用完全隔离不互相破坏。
 *   - 壳↔子应用通信用 postMessage 替代 micro-app 的 setData/addDataListener。
 *   - Aurora token 通过 postMessage 把用户名/对话列表等数据传给子应用渲染；
 *     子应用的样式自带 aurora.css（独立运行也需），不依赖继承壳 :root。
 *
 * 消息协议（壳 → 子应用，type 前缀 'shell:'）：
 *   { source: 'shell', type: 'view', view, conversationId }  视图意图
 * 消息协议（子应用 → 壳，type 前缀 'sub:'）：
 *   { source: 'sub', type: 'conversations', conversations, activeId }  对话列表
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { SUB_APPS, type SubAppName } from "@/config";
import { useShellStore } from "@/store/shell";

const route = useRoute();
const shell = useShellStore();

/** 路由 → 子应用：/account → auth，/executor → executor，其余 → core。 */
const appName = computed<SubAppName>(() => {
  if (route.path.startsWith("/account")) return "auth";
  if (route.path.startsWith("/executor")) return "executor";
  return "core";
});

const appUrl = computed(() => SUB_APPS[appName.value].url);
const iframeRef = ref<HTMLIFrameElement | null>(null);

/**
 * 计算当前视图意图 + 对话 id，通过 postMessage 发给 core 子应用。
 * 子应用收到后切换内部路由。
 */
function buildIntent() {
  const path = route.path;
  const view =
    path.startsWith("/creation") ? "creation"
    : path.startsWith("/tasks") ? "tasks"
    : "chat"; // 默认（含 / 和 /chat）→ 对话
  const conversationId = path.startsWith("/chat/") ? path.split("/")[2] : null;
  return { source: "shell", type: "view" as const, view, conversationId };
}

function postToSub(msg: unknown): void {
  const win = iframeRef.value?.contentWindow;
  if (win) win.postMessage(msg, appUrl.value);
}

/**
 * 把壳的登录态（token）推给子应用。
 *
 * 为什么必须推：iframe 跨域（壳 26600 / core 26688 / auth 26678 / executor 26698）
 * 的 localStorage 不共享——壳登录后 token 只在 26600 域，子应用读不到，所有
 * 接口都 401。这里用 postMessage 把 token 注入子应用域的 localStorage。
 *
 * 时机：iframe 每次 load + 壳 token 变化（登录/登出）时各推一次。
 */
function pushAuth(): void {
  postToSub({
    source: "shell",
    type: "auth",
    token: shell.token || null,
  });
}

watch(
  () => route.path,
  () => postToSub(buildIntent()),
);

// token 变化时同步给子应用（登录成功 / 登出）。
watch(
  () => shell.token,
  () => pushAuth(),
);

/** iframe 加载完成后立即下发视图意图 + 登录态。 */
function onIframeLoad(): void {
  pushAuth();
  postToSub(buildIntent());
}

/**
 * 接收子应用推过来的消息（对话列表等）。
 * 严格校验 source 和 origin，避免收到无关 postMessage。
 */
function onMessage(e: MessageEvent): void {
  if (e.origin !== new URL(appUrl.value).origin) return;
  const d = e.data as {
    source?: string;
    type?: string;
    conversations?: { id: number; title: string; status?: string }[];
    activeId?: number | null;
  };
  if (d?.source !== "sub") return;
  if (d.type === "conversations" && Array.isArray(d.conversations)) {
    shell.setConversations(
      d.conversations.map((c) => ({ id: c.id, title: c.title, status: c.status })),
      d.activeId ?? null,
    );
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("message", onMessage);
}
onBeforeUnmount(() => {
  if (typeof window !== "undefined") window.removeEventListener("message", onMessage);
  ro?.disconnect();
});

/**
 * 显式同步 iframe 像素尺寸到父容器（.content）。
 *
 * 为什么不纯靠 CSS height:100%：Chrome 4K 高 DPI 下首帧 flex 布局竞态会让
 * 父容器高度在首帧未稳定，iframe height:100% 据此锁定错误的小尺寸（页面只
 * 占左上角，resize 才恢复）。改用 JS 读父容器 clientWidth/Height 写死 iframe
 * 像素尺寸，绕过 % 高度的解析时序。ResizeObserver 持续响应窗口变化。
 */
function syncIframeSize(): void {
  const iframe = iframeRef.value;
  // iframe 的父级是 .content（router-view 直接渲染组件根 iframe，无包裹 div）。
  const host = iframe?.parentElement;
  if (!iframe || !host) return;
  iframe.style.width = `${host.clientWidth}px`;
  iframe.style.height = `${host.clientHeight}px`;
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  syncIframeSize();
  const host = iframeRef.value?.parentElement;
  if (host && typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => syncIframeSize());
    ro.observe(host);
  }
});
</script>

<template>
  <iframe
    ref="iframeRef"
    :src="appUrl"
    class="sub-iframe"
    :title="appName"
    @load="onIframeLoad"
  />
</template>

<style scoped>
.sub-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
