import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import microApp from "@micro-zoe/micro-app";

import App from "./App.vue";
import router from "./router";
import "./styles/global.css";

// micro-app 初始化：以 web 端口为主壳，加载三个子应用。
// 子应用 URL 通过环境变量配置（见 .env.example），默认指向本地 dev server。
microApp.start({
  // 子应用生命周期的全局监听（可选）。
  lifeCycles: {
    created() {
      // eslint-disable-next-line no-console
      console.info("[micro-app] subapp created");
    },
    error() {
      // eslint-disable-next-line no-console
      console.error("[micro-app] subapp load error");
    },
  },
  // 预加载子应用资源（可选，提升首次切换速度）。
  prefetchLevel: 0,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.mount("#app");
