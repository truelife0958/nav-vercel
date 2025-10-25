import axios from 'axios';

// 直接使用生产环境 API 地址
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const BASE = BASE_URL;

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMsg = data?.details || data?.error || error.message;

      if (status === 401) {
        const msg = data?.error || '';
        if (msg.includes('过期') || msg.includes('无效token') || msg.includes('未授权')) {
          localStorage.removeItem('token');
          if (window.location.pathname.includes('/admin')) {
            alert('登录已过期，请重新登录');
            window.location.reload();
          }
        } else {
          alert(`认证失败: ${errorMsg}`);
        }
      } else {
        // 对于其他所有错误，显示一个通用的错误提示
        alert(`请求失败: ${errorMsg}`);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      alert('网络错误，请检查您的连接');
    } else {
      // 设置请求时触发了一个错误
      alert(`请求错误: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export const login = (username, password) => axios.post(`${BASE}/login`, { username, password });

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 菜单相关API
export const getMenus = () => axios.get(`${BASE}/menus`);
export const addMenu = (data) => axios.post(`${BASE}/menus`, data, { headers: authHeaders() });
export const updateMenu = (id, data) => axios.put(`${BASE}/menus/${id}`, data, { headers: authHeaders() });
export const deleteMenu = (id) => axios.delete(`${BASE}/menus/${id}`, { headers: authHeaders() });

// 子菜单相关API
export const getSubMenus = (menuId) => axios.get(`${BASE}/menus/${menuId}/submenus`);
export const addSubMenu = (menuId, data) => axios.post(`${BASE}/menus/${menuId}/submenus`, data, { headers: authHeaders() });
export const updateSubMenu = (id, data) => axios.put(`${BASE}/menus/submenus/${id}`, data, { headers: authHeaders() });
export const deleteSubMenu = (id) => axios.delete(`${BASE}/menus/submenus/${id}`, { headers: authHeaders() });

// 卡片相关API
export const getCards = (menuId, subMenuId = null) => {
  const params = subMenuId ? { subMenuId } : {};
  return axios.get(`${BASE}/cards/${menuId}`, { params });
};
export const addCard = (data) => axios.post(`${BASE}/cards`, data, { headers: authHeaders() });
export const updateCard = (id, data) => axios.put(`${BASE}/cards/${id}`, data, { headers: authHeaders() });
export const deleteCard = (id) => axios.delete(`${BASE}/cards/${id}`, { headers: authHeaders() });

export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post(`${BASE}/upload`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
};

// 广告API
export const getAds = () => axios.get(`${BASE}/ads`);
export const addAd = (data) => axios.post(`${BASE}/ads`, data, { headers: authHeaders() });
export const updateAd = (id, data) => axios.put(`${BASE}/ads/${id}`, data, { headers: authHeaders() });
export const deleteAd = (id) => axios.delete(`${BASE}/ads/${id}`, { headers: authHeaders() });

// 友链API
export const getFriends = () => axios.get(`${BASE}/friends`);
export const addFriend = (data) => axios.post(`${BASE}/friends`, data, { headers: authHeaders() });
export const updateFriend = (id, data) => axios.put(`${BASE}/friends/${id}`, data, { headers: authHeaders() });
export const deleteFriend = (id) => axios.delete(`${BASE}/friends/${id}`, { headers: authHeaders() });

// 用户API
export const getUserProfile = () => axios.get(`${BASE}/users/me`, { headers: authHeaders() });
export const getUserProfileAlt = () => axios.get(`${BASE}/users/profile`, { headers: authHeaders() });
export const changePassword = (oldPassword, newPassword) => axios.put(`${BASE}/users/password`, { oldPassword, newPassword }, { headers: authHeaders() });
export const getUsers = () => axios.get(`${BASE}/users`, { headers: authHeaders() });

// AI辅助API
export const enhanceWebsites = (websites) => axios.post(`${BASE}/ai/enhance-websites`, { websites }, { headers: authHeaders() });
export const getWebsiteInfo = (url) => axios.post(`${BASE}/ai/get-website-info`, { url }, { headers: authHeaders() });

// 批量导入API
export const batchImportCards = (cards) => {
  return Promise.all(cards.map(card => addCard(card)));
};

// JSON导入辅助函数
export const parseJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(new Error('JSON文件格式错误'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};

// HTML解析辅助函数
export const parseHtmlFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const htmlContent = e.target.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // 提取所有链接
        const links = doc.querySelectorAll('a[href]');
        const parsedData = [];

        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            const title = link.textContent.trim() || link.getAttribute('title') || '未命名';
            const desc = link.getAttribute('title') || '';

            parsedData.push({
              title: title,
              url: href,
              logo_url: '',
              desc: desc
            });
          }
        });

        // 去重
        const uniqueData = [];
        const seen = new Set();

        for (const item of parsedData) {
          if (!seen.has(item.url)) {
            seen.add(item.url);
            uniqueData.push(item);
          }
        }

        resolve(uniqueData);
      } catch (error) {
        reject(new Error('HTML文件解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};
