<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-card">
      <h2 class="login-title">后台管理登录</h2>
      <div class="login-form">
        <input v-model="username" type="text" placeholder="用户名" class="login-input" @keyup.enter="handleLogin" />
        <div class="password-input-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            class="login-input password-input"
            @keyup.enter="handleLogin"
          />
          <span class="toggle-password" @click="showPassword = !showPassword">
            <svg v-if="showPassword" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
          </span>
        </div>
        <div class="login-buttons">
          <button @click="goHome" class="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回首页
          </button>
          <button @click="handleLogin" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>
  </div>
  
  <div v-else class="admin-layout">
    <aside class="admin-sider" :class="{ open: siderOpen }" @click.self="closeSider">
      <div class="logo clickable" @click="page='welcome'; closeSider()">Admin</div>
      <ul class="menu-list">
        <li :class="{active: page==='menu'}" @click="page='menu'; closeSider()">栏目管理</li>
        <li :class="{active: page==='card'}" @click="page='card'; closeSider()">卡片管理</li>
        <li :class="{active: page==='ad'}" @click="page='ad'; closeSider()">广告管理</li>
        <li :class="{active: page==='friend'}" @click="page='friend'; closeSider()">友链管理</li>
        <li :class="{active: page==='brand'}" @click="page='brand'; closeSider()">品牌设置</li>
        <li :class="{active: page==='user'}" @click="page='user'; closeSider()">用户管理</li>
      </ul>
    </aside>
    <main class="admin-main">
      <div class="admin-header">
        <button class="menu-toggle" @click="toggleSider">
          &#9776;
        </button>
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <span class="home-icon" @click="goHome" title="进入主页">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <button class="btn logout-btn" @click="logout">退出登录</button>
        </div>
      </div>
      <div class="admin-content">
        <div v-if="page==='welcome'" class="welcome-page">
          <h2 class="welcome-title">欢迎您进入 nav-pro 后台管理系统</h2>
          <div class="welcome-cards">
            <div class="welcome-card">
              <div class="welcome-icon time-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1abc9c" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#1abc9c" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div class="welcome-label">上次登录时间</div>
              <div class="welcome-value">{{ lastLoginTime || '--' }}</div>
            </div>
            <div class="welcome-card">
              <div class="welcome-icon ip-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1abc9c" stroke-width="2"/><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke="#1abc9c" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="#1abc9c"/></svg>
              </div>
              <div class="welcome-label">上次登录IP</div>
              <div class="welcome-value">{{ lastLoginIp || '--' }}</div>
            </div>
          </div>
        </div>
        <MenuManage v-if="page==='menu'" />
        <CardManage v-if="page==='card'" />
        <AdManage v-if="page==='ad'" />
        <FriendLinkManage v-if="page==='friend'" />
        <BrandSettings v-if="page==='brand'" />
        <UserManage v-if="page==='user'" />
      </div>
      <footer class="admin-footer">
        <p class="admin-copyright">Copyright © 2025 nav-pro | Powered by marry</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { login, getUserProfile } from '../api';
import MenuManage from './admin/MenuManage.vue';
import CardManage from './admin/CardManage.vue';
import AdManage from './admin/AdManage.vue';
import FriendLinkManage from './admin/FriendLinkManage.vue';
import BrandSettings from './admin/BrandSettings.vue';
import UserManage from './admin/UserManage.vue';

const page = ref('welcome');
const lastLoginTime = ref('');
const lastLoginIp = ref('');
const isLoggedIn = ref(false);
const username = ref('');
const password = ref('');
const loading = ref(false);
const loginError = ref('');
const showPassword = ref(false);
const siderOpen = ref(false);

const pageTitle = computed(() => {
  switch (page.value) {
    case 'menu': return '栏目管理';
    case 'card': return '卡片管理';
    case 'ad': return '广告管理';
    case 'friend': return '友链管理';
    case 'brand': return '品牌设置';
    case 'user': return '用户管理';
    default: return '';
  }
});

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  if (isLoggedIn.value) {
    // 拉取用户信息
    fetchLastLoginInfo();
  }
});
async function fetchLastLoginInfo() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await getUserProfile();
    if (response.data) {
      lastLoginTime.value = response.data.last_login_time || '';
      lastLoginIp.value = response.data.last_login_ip || '';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 如果是网络错误或解析错误，静默处理
    if (error instanceof SyntaxError) {
      console.error('JSON解析失败，响应可能不是JSON格式');
    }
  }
}

async function handleLogin() {
  if (!username.value || !password.value) {
    loginError.value = '请输入用户名和密码';
    return;
  }
  
  loading.value = true;
  loginError.value = '';
  
  try {
    const response = await login(username.value, password.value);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      isLoggedIn.value = true;
      lastLoginTime.value = response.data.lastLoginTime || '';
      lastLoginIp.value = response.data.lastLoginIp || '';
    }
  } catch (error) {
    loginError.value = error.response?.data?.message || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  username.value = '';
  password.value = '';
  loginError.value = '';
}

function goHome() {
  window.open('/', '_blank');
}
function toggleSider() {
  siderOpen.value = !siderOpen.value;
}
function closeSider() {
  siderOpen.value = false;
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: moveBackground 20s linear infinite;
}

@keyframes moveBackground {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 0 40px 40px 40px;
  width: 400px;
  max-width: 90%;
  position: relative;
  z-index: 1;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #2164e1;
  margin-bottom: 32px;
  letter-spacing: 2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-input {
  padding: 12px 16px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  font-size: 16px;
  background: #fff;
  color: #222;
  height: 48px;
  line-height: 48px;
  box-sizing: border-box;
}

.login-input:focus {
  outline: 2px solid #2566d8;
  border-color: #2566d8;
}

.login-btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #174ea6;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.back-btn {
  background: #f8f9fa;
  color: #2b2b2b;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.back-btn:hover {
  background: #e9ecef;
  color: #7e42ff;
  border-color: #adb5bd;
}

.login-btn {
  flex: 2;
}

.login-error {
  color: #e74c3c;
  text-align: center;
  margin: 0;
  font-size: 14px;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ebf2 100%);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.admin-sider {
  width: 220px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%);
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 32px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-sider::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}
.logo {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  position: relative;
}

.logo::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.logo.clickable:hover::after {
  width: 60%;
}

.logo.clickable:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
}
.menu-list {
  list-style: none;
  padding: 0 12px;
  margin: 0;
  flex: 1;
}

.menu-list li {
  padding: 14px 20px;
  margin: 6px 0;
  cursor: pointer;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #4a5568;
  position: relative;
  overflow: hidden;
}

.menu-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-list li:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateX(5px);
}

.menu-list li.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
}

.menu-list li.active::before {
  transform: scaleY(1);
}
.admin-main {
  flex: 1;
  background: transparent;
  padding: 70px 0 0 220px;
  min-width: 0;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.admin-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
  padding: 0 48px 0 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 220px;
  right: 0;
  z-index: 101;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.header-title {
  flex: 1;
  text-align: center;
  margin-left: 220px;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.home-icon {
  display: flex;
  align-items: center;
  margin-right: 18px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  padding: 4px;
}
.home-icon:hover {
  background: #eaf1ff;
}
.btn.logout-btn {
  background: #f7caca;
  color: #e74c3c;
  border: 1px solid #f7caca;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  transition: background 0.2s, color 0.2s;
}
.btn.logout-btn:hover {
  background: #e74c3c;
  color: #fff;
}
.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  margin-top: 0;
  width: 100%;
  box-sizing: border-box;
}
.admin-footer {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0 1rem 0;
  background: transparent;
}
.admin-copyright {
  color: #1d70cc;
  font-size: 14px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.footer-link {
  color: #1d70cc;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #3218ed;
}
.password-input-wrapper {
  position: relative;
  width: 100%;
}
.password-input {
  width: 100%;
  padding-right: 48px;
  border-radius: 8px;
  box-sizing: border-box;
}
.toggle-password {
  position: absolute;
  top: 0;
  right: 0;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #2566d8;
  margin: 0;
  padding: 0;
  z-index: 2;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: #174ea6;
  background: none;
}
.toggle-password svg {
  display: block;
  width: 22px;
  height: 22px;
  pointer-events: none;
}
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  animation: fadeIn 0.6s ease-out;
}

.welcome-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 48px;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-cards {
  display: flex;
  gap: 40px;
}

.welcome-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 36px 44px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: scaleIn 0.5s ease-out;
  animation-fill-mode: backwards;
}

.welcome-card:nth-child(1) { animation-delay: 0.1s; }
.welcome-card:nth-child(2) { animation-delay: 0.2s; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.welcome-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}
.welcome-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.welcome-card:hover .welcome-icon {
  transform: rotate(5deg) scale(1.1);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

.welcome-label {
  font-size: 1.05rem;
  color: #4a5568;
  margin-bottom: 12px;
  font-weight: 500;
}

.welcome-value {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: 0.5px;
}
@media (max-width: 900px) {
  .welcome-cards {
    flex-direction: column;
    gap: 18px;
    align-items: center;
  }
  .welcome-card {
    min-width: 220px;
    width: 90vw;
    padding: 24px 10px;
  }
}
@media (max-width: 768px) {
  .admin-sider {
    position: fixed;
    left: 0;
    top: 0;
    width: 70vw;
    max-width: 260px;
    height: 100vh;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s;
    box-shadow: 2px 0 8px rgba(0,0,0,0.12);
    background: #fff;
  }
  .admin-sider.open {
    transform: translateX(0);
  }
  .admin-main {
    padding: 64px 0 0 0 !important;
  }
  .admin-header {
    left: 0 !important;
    width: 100vw !important;
    min-width: 0 !important;
    padding: 0 8px 0 8px !important;
    box-sizing: border-box;
    flex-wrap: nowrap;
    height: 56px;
  }
  .header-title {
    font-size: 1.1rem !important;
    margin-left: 0 !important;
    text-align: left !important;
    width: auto !important;
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 1px;
  }
  .header-actions {
    gap: 4px;
    margin-left: 0;
  }
  .btn.logout-btn {
    padding: 4px 8px;
    font-size: 13px;
    border-radius: 8px;
  }
  .menu-toggle {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 4px !important;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #2566d8;
    z-index: 300;
  }
  /* 表单和按钮间距优化 */
  .input, .btn {
    margin-bottom: 8px;
  }
}
.menu-toggle {
  display: none;
}
</style> 