/**
 * 壳直连 auth 后端的最小客户端。
 *
 * 为什么壳需要自己调 auth：
 *   设计稿把登录做成顶栏弹窗（design/nucleagent-design.html 第 2053–2113 行），
 *   不是独立页面。弹窗属于壳的 chrome，所以壳必须自己发登录请求，不能等
 *   auth 子应用加载完再说。
 *
 * 为什么不复用 nucleagent-auth 子应用的 api/auth.ts：
 *   那份用 axios + 相对路径 `/api`，依赖子应用自己的 vite 代理；壳是跨域直连
 *   http://localhost:26670，两者的 baseURL 语义不同。
 *
 * 范围严格限制在「登录态」三件事：登录 / 注册 / 拉当前用户。
 * API Key 等深层账户管理仍归 auth 子应用（挂在 /account 路由）。
 *
 * 契约见 nucleagent-docs/04-api-contracts.md §3：
 *   auth 返回 { code, message, data } 数字信封，与 core 的裸资源不同。
 */
import { AUTH_API_BASE, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config";

const BASE = `${AUTH_API_BASE}/api/v1/addons/auth`;

export interface UserInfo {
  id: number;
  username: string;
  nickName?: string;
  roleId?: number;
  roles?: string[];
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  nickName?: string;
}

/** 业务/网络错误统一形态，便于 UI 直接展示 message。 */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function getAccessToken(): string {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * auth 后端的数字信封：{ code, message, data }。
 * code 非 0 视为业务失败——HTTP 200 也可能是失败，不能只看 status。
 */
interface Envelope<T> {
  code?: number;
  message?: string;
  data?: T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    // fetch 只在网络层失败时 reject；给出比 "Failed to fetch" 更可诊断的信息
    // （最常见原因是 auth 后端没起，或 CORS 白名单没放行壳的来源）。
    throw new AuthError(`无法连接认证服务（${AUTH_API_BASE}）`, 0);
  }

  let body: Envelope<T> | undefined;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    // 后端异常时可能返回非 JSON（如网关 HTML 错误页）。
    body = undefined;
  }

  if (!response.ok) {
    throw new AuthError(body?.message || `请求失败（HTTP ${response.status}）`, response.status);
  }
  // HTTP 200 但 code != 0 仍是失败。
  if (body?.code !== undefined && body.code !== 0) {
    throw new AuthError(body.message || "请求失败", response.status);
  }
  return body?.data as T;
}

export function login(payload: LoginPayload): Promise<TokenData> {
  return request<TokenData>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload): Promise<void> {
  return request<void>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchUserInfo(): Promise<UserInfo> {
  return request<UserInfo>("/user-info");
}
