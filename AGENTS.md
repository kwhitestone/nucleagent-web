# nucleagent-web

微前端主壳。基于 micro-app (micro-zoe)。

## 构建

```bash
npm install
npm run dev           # 开发 (:3000)
npm run build         # 生产构建
```

## 架构约束

- 使用 micro-app (micro-zoe) 加载 3 个子应用
- 子应用来源：auth (:6678) / core (:6688) / executor (:6698)
- 主壳负责全局路由分发、认证状态、布局框架
- 子应用独立部署，主壳通过 micro-app 标签加载
- 认证 JWT 存在主壳，通过 micro-app data 属性传递给子应用

## 子应用

| 子应用 | 前端端口 | 后端端口 | 职责 |
|--------|---------|---------|------|
| auth | 6678 | 6670 | 登录/注册 |
| core | 6688 | 6680 | 对话/Agent/技能/管理 |
| executor | 6698 | 6690 | 会话监控 |

## 边界

- **Always**: 子应用路由以子应用名为前缀（/auth/*, /core/*, /executor/*）
- **Never**: 禁止在主壳写业务逻辑（只做路由 + 布局 + 认证状态）
- **Never**: 禁止直接访问子应用的后端 API（通过子应用代理）
