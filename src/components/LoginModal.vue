<script setup lang="ts">
/**
 * 登录弹窗 —— 对齐 design/nucleagent-design.html 第 2053–2113 行。
 *
 * 三个 tab：账号 / 手机 / 扫码。当前只接「账号登录」（后端仅此模式），
 * 另两个 tab 保留视觉但标记「敬请期待」，避免点进去空白让人以为坏了。
 * OAuth 三个按钮同理——后端 openid-auth addon 未启用，先做占位。
 */
import { reactive, ref, watch } from "vue";
import { useShellStore } from "@/store/shell";
import { AuthError } from "@/api/auth";

const shell = useShellStore();

type Tab = "account" | "phone" | "qrcode";
const tab = ref<Tab>("account");

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const errorMsg = ref("");
const remember = ref(true);

// 每次打开重置表单，避免上次失败的脏值残留。
watch(
  () => shell.loginModalOpen,
  (open) => {
    if (open) {
      form.username = "";
      form.password = "";
      errorMsg.value = "";
      tab.value = "account";
    }
  },
);

function close(): void {
  shell.closeLoginModal();
}

async function submit(): Promise<void> {
  if (loading.value) return;
  if (!form.username.trim() || !form.password) {
    errorMsg.value = "请输入用户名和密码";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await shell.login({ username: form.username.trim(), password: form.password });
  } catch (e) {
    errorMsg.value = e instanceof AuthError ? e.message : "登录失败，请重试";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <transition name="modal">
    <div v-if="shell.loginModalOpen" class="modal-overlay" @click.self="close">
      <div class="modal anim-bounce">
        <div class="modal-header">
          <div class="modal-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
              <path d="M12 22V12" />
              <path d="M4 7l8 5 8-5" />
            </svg>
          </div>
          <h2 class="modal-title">欢迎回来</h2>
          <p class="modal-subtitle">登录以继续你的 AI 工作流</p>
        </div>

        <div class="login-tabs">
          <button class="login-tab" :class="{ active: tab === 'account' }" @click="tab = 'account'">账号登录</button>
          <button class="login-tab" :class="{ active: tab === 'phone' }" @click="tab = 'phone'">手机登录</button>
          <button class="login-tab" :class="{ active: tab === 'qrcode' }" @click="tab = 'qrcode'">扫码登录</button>
        </div>

        <!-- 账号登录表单 -->
        <div v-if="tab === 'account'" class="login-form">
          <div class="login-input-group">
            <span class="input-prefix">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </span>
            <input v-model="form.username" type="text" class="login-input" placeholder="用户名 / 邮箱" @keyup.enter="submit" />
          </div>
          <div class="login-input-group">
            <span class="input-prefix">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            </span>
            <input v-model="form.password" type="password" class="login-input" placeholder="密码" @keyup.enter="submit" />
          </div>

          <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

          <div class="login-options">
            <label class="login-checkbox"><input v-model="remember" type="checkbox" /> 记住我</label>
            <a class="login-link">忘记密码？</a>
          </div>
          <button class="login-submit" :disabled="loading" @click="submit">
            {{ loading ? "登录中…" : "登 录" }}
          </button>

          <div class="login-divider"><span>或</span></div>

          <div class="login-oauth">
            <button class="oauth-btn" title="飞书（敬请期待）">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" /></svg>
            </button>
            <button class="oauth-btn" title="抖音（敬请期待）">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.39z" /></svg>
            </button>
            <button class="oauth-btn" title="GitHub（敬请期待）">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10 10 0 0022 12c0-5.52-4.48-10-10-10z" /></svg>
            </button>
          </div>
        </div>

        <!-- 手机 / 扫码 tab：后端未实现，给明确占位而非空白 -->
        <div v-else class="login-placeholder">
          <div class="placeholder-icon">🚧</div>
          <p>{{ tab === "phone" ? "手机登录" : "扫码登录" }}敬请期待</p>
          <p class="placeholder-hint">当前请使用账号登录</p>
        </div>

        <div class="modal-footer">
          还没有账号？<a class="login-link">立即注册</a>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 对齐设计稿第 1367–1640 行（Login Modal）。 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 400px;
  max-width: calc(100vw - 32px);
  background: var(--bg-card);
  border-radius: var(--r-2xl);
  box-shadow: var(--shadow-xl);
  padding: 32px;
  position: relative;
}

.modal-header { text-align: center; margin-bottom: 24px; }

.modal-logo {
  width: 56px;
  height: 56px;
  border-radius: var(--r-lg);
  background: var(--grad-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: var(--shadow-glow-teal);
}

.modal-logo svg { width: 28px; height: 28px; }

.modal-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.modal-subtitle { font-size: 13px; color: var(--text-secondary); }

.login-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-subtle);
  padding: 4px;
  border-radius: var(--r-md);
  margin-bottom: 24px;
}

.login-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.login-tab.active {
  background: var(--bg-card);
  color: var(--indigo-600);
  box-shadow: var(--shadow-sm);
}

.login-form { display: flex; flex-direction: column; gap: 14px; }

.login-input-group { position: relative; display: flex; align-items: center; }

.input-prefix {
  position: absolute;
  left: 14px;
  display: flex;
  color: var(--text-tertiary);
  pointer-events: none;
}

.input-prefix svg { width: 18px; height: 18px; }

.login-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  font-size: 14px;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: var(--bg-card);
  transition: all 0.2s var(--ease);
}

.login-input:focus {
  outline: none;
  border-color: var(--indigo-400);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.login-error { font-size: 12.5px; color: var(--rose-500); margin: -4px 0 0; }

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.login-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  cursor: pointer;
}

.login-checkbox input { accent-color: var(--indigo-500); }

.login-link { color: var(--indigo-500); cursor: pointer; font-weight: 500; }
.login-link:hover { text-decoration: underline; }

.login-submit {
  padding: 12px;
  border: none;
  border-radius: var(--r-md);
  background: var(--grad-teal-indigo);
  background-size: 200% 200%;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--ease);
  animation: gradient-flow 5s var(--ease) infinite;
  box-shadow: var(--shadow-glow-teal);
}

.login-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-glow-indigo); }
.login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.login-divider { position: relative; text-align: center; margin: 4px 0; }

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
}

.login-divider span {
  position: relative;
  background: var(--bg-card);
  padding: 0 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.login-oauth { display: flex; justify-content: center; gap: 12px; }

.oauth-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--r-full);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.oauth-btn:hover { border-color: var(--indigo-400); color: var(--indigo-500); transform: translateY(-2px); }
.oauth-btn svg { width: 18px; height: 18px; }

.login-placeholder { text-align: center; padding: 32px 0; color: var(--text-secondary); }
.placeholder-icon { font-size: 40px; margin-bottom: 12px; }
.placeholder-hint { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }

.modal-footer { text-align: center; margin-top: 24px; font-size: 13px; color: var(--text-secondary); }

/* transition: 弹窗淡入 + 轻微缩放 */
.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s var(--ease); }
.modal-enter-active .modal,
.modal-leave-active .modal { transition: transform 0.3s var(--ease-spring), opacity 0.25s var(--ease); }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal,
.modal-leave-to .modal { transform: scale(0.92); opacity: 0; }
</style>
