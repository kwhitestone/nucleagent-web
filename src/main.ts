import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Aurora 设计 token 必须先于 global.css 引入（global.css 的规则依赖这些变量）。
// aurora.css 由 nucleagent-deploy/scripts/sync-design-tokens.sh 从设计稿生成，勿手改。
import "./styles/aurora.css";
import "./styles/global.css";

// 子应用以 iframe 加载（见 views/MicroAppHost.vue），不再用 micro-app。
// micro-app 沙箱与 Vite ESM 冲突（import 无法在沙箱执行），iframe 是稳定路径。

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
