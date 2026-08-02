/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

// micro-app 自定义元素类型声明
declare module "@micro-zoe/micro-app" {
  const microApp: {
    start: (options?: Record<string, unknown>) => void;
    [key: string]: unknown;
  };
  export default microApp;
}
