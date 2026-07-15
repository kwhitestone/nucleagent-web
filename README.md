# nucleagent-web

Nucleagent 微前端主壳。基于 [micro-app](https://micro-zoe.github.io/micro-app/) 实现。

## 职责

- 加载和编排各服务的微前端子应用
- 全局路由分发
- 全局认证状态管理
- 统一的 UI 框架和布局

## 子应用

| 子应用 | 来源 | 前端端口 |
|--------|------|---------|
| core | nucleagent-core/app/src/web | 6688 |
| auth | nucleagent-auth/app/src/web | 6678 |
| executor | nucleagent-executor/app/src/web | 6698 |

## 端口

- 主壳: 80 (生产) / 3000 (开发)
