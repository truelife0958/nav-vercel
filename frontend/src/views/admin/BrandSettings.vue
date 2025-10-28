<template>
  <div class="brand-settings">
    <div class="settings-card">
      <h3 class="section-title">品牌设置</h3>
      
      <div class="settings-form">
        <!-- 品牌名称 -->
        <div class="form-group">
          <label>品牌名称：</label>
          <input 
            v-model="formData.brand_name" 
            type="text" 
            placeholder="请输入品牌名称（如：导航Pro）" 
            class="input" 
            maxlength="50"
          />
        </div>

        <!-- 品牌Logo -->
        <div class="form-group">
          <label>品牌Logo：</label>
          <div class="logo-upload-area">
            <div class="logo-preview">
              <img 
                v-if="formData.brand_logo" 
                :src="formData.brand_logo" 
                alt="品牌Logo预览" 
                class="preview-image"
              />
              <div v-else class="preview-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>暂无Logo</p>
              </div>
            </div>
            <div class="upload-controls">
              <input 
                ref="fileInput" 
                type="file" 
                accept="image/*" 
                @change="handleFileChange" 
                style="display: none"
              />
              <button @click="triggerFileInput" class="btn btn-secondary">
                选择图片
              </button>
              <button 
                v-if="formData.brand_logo" 
                @click="clearLogo" 
                class="btn btn-danger"
              >
                清除
              </button>
            </div>
            <p class="upload-tip">推荐尺寸: 200x200px，支持 JPG、PNG、GIF 格式，最大 2MB</p>
          </div>
        </div>

        <!-- 品牌口号 -->
        <div class="form-group">
          <label>品牌口号：</label>
          <input 
            v-model="formData.brand_slogan" 
            type="text" 
            placeholder="请输入品牌口号（如：您的专业导航助手）" 
            class="input"
            maxlength="100"
          />
        </div>

        <!-- 备案号 -->
        <div class="form-group">
          <label>ICP备案号：</label>
          <input 
            v-model="formData.icp_number" 
            type="text" 
            placeholder="请输入ICP备案号（如：京ICP备12345678号）" 
            class="input"
            maxlength="50"
          />
        </div>

        <!-- 公安备案号 -->
        <div class="form-group">
          <label>公安备案号：</label>
          <input 
            v-model="formData.police_number" 
            type="text" 
            placeholder="请输入公安备案号" 
            class="input"
            maxlength="50"
          />
        </div>

        <!-- 版权信息 -->
        <div class="form-group">
          <label>版权信息：</label>
          <input 
            v-model="formData.copyright" 
            type="text" 
            placeholder="请输入版权信息（如：Copyright © 2025 导航Pro）" 
            class="input"
            maxlength="100"
          />
        </div>

        <!-- 联系邮箱 -->
        <div class="form-group">
          <label>联系邮箱：</label>
          <input 
            v-model="formData.contact_email" 
            type="email" 
            placeholder="请输入联系邮箱" 
            class="input"
            maxlength="100"
          />
        </div>

        <!-- 关于我们 -->
        <div class="form-group">
          <label>关于我们：</label>
          <textarea 
            v-model="formData.about" 
            placeholder="请输入关于我们的简介" 
            class="textarea"
            rows="4"
            maxlength="500"
          ></textarea>
          <span class="char-count">{{ formData.about?.length || 0 }}/500</span>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button @click="handleReset" class="btn btn-secondary" :disabled="loading">
            重置
          </button>
          <button @click="handleSave" class="btn btn-primary" :disabled="loading">
            {{ loading ? '保存中...' : '保存设置' }}
          </button>
        </div>

        <p v-if="message" :class="['message', messageType]">{{ message }}</p>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-card">
      <h3 class="section-title">效果预览</h3>
      <div class="preview-content">
        <!-- 导航栏预览 -->
        <div class="preview-section">
          <h4>导航栏效果</h4>
          <div class="navbar-preview">
            <div class="navbar-brand">
              <img 
                v-if="formData.brand_logo" 
                :src="formData.brand_logo" 
                alt="Logo" 
                class="brand-logo"
              />
              <span class="brand-name">{{ formData.brand_name || '品牌名称' }}</span>
            </div>
            <div class="navbar-slogan">{{ formData.brand_slogan || '品牌口号' }}</div>
          </div>
        </div>

        <!-- 页脚预览 -->
        <div class="preview-section">
          <h4>页脚效果</h4>
          <div class="footer-preview">
            <p class="footer-text">{{ formData.copyright || '版权信息' }}</p>
            <p v-if="formData.icp_number" class="footer-text">
              {{ formData.icp_number }}
            </p>
            <p v-if="formData.police_number" class="footer-text">
              {{ formData.police_number }}
            </p>
            <p v-if="formData.contact_email" class="footer-text">
              联系邮箱：{{ formData.contact_email }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getBrandSettings, updateBrandSettings, uploadLogo } from '../../api';

const formData = ref({
  brand_name: '',
  brand_logo: '',
  brand_slogan: '',
  icp_number: '',
  police_number: '',
  copyright: '',
  contact_email: '',
  about: ''
});

const originalData = ref({});
const loading = ref(false);
const message = ref('');
const messageType = ref('success');
const fileInput = ref(null);
const uploadingLogo = ref(false);

onMounted(async () => {
  await loadSettings();
});

async function loadSettings() {
  try {
    const response = await getBrandSettings();
    if (response.data) {
      formData.value = { ...response.data };
      originalData.value = { ...response.data };
    }
  } catch (error) {
    console.error('加载品牌设置失败:', error);
    showMessage('加载品牌设置失败', 'error');
  }
}

function triggerFileInput() {
  fileInput.value.click();
}

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 验证文件大小
  if (file.size > 2 * 1024 * 1024) {
    showMessage('图片大小不能超过2MB', 'error');
    return;
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showMessage('请选择有效的图片文件', 'error');
    return;
  }

  uploadingLogo.value = true;
  try {
    const response = await uploadLogo(file);
    if (response.data && response.data.url) {
      formData.value.brand_logo = response.data.url;
      showMessage('Logo上传成功', 'success');
    }
  } catch (error) {
    console.error('Logo上传失败:', error);
    showMessage(error.response?.data?.message || 'Logo上传失败', 'error');
  } finally {
    uploadingLogo.value = false;
    // 清空文件选择，允许重新选择相同文件
    event.target.value = '';
  }
}

function clearLogo() {
  formData.value.brand_logo = '';
  showMessage('Logo已清除', 'success');
}

async function handleSave() {
  // 验证必填字段
  if (!formData.value.brand_name) {
    showMessage('品牌名称不能为空', 'error');
    return;
  }

  // 验证邮箱格式
  if (formData.value.contact_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.value.contact_email)) {
      showMessage('请输入有效的邮箱地址', 'error');
      return;
    }
  }

  loading.value = true;
  message.value = '';

  try {
    await updateBrandSettings(formData.value);
    originalData.value = { ...formData.value };
    showMessage('品牌设置保存成功', 'success');
  } catch (error) {
    console.error('保存品牌设置失败:', error);
    showMessage(error.response?.data?.message || '保存品牌设置失败', 'error');
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  formData.value = { ...originalData.value };
  showMessage('已重置为上次保存的设置', 'success');
}

function showMessage(text, type) {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}
</script>

<style scoped>
.brand-settings {
  max-width: 1400px;
  width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-card,
.preview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 24px;
}

.section-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: #222;
  margin-bottom: 24px;
  border-bottom: 2px solid #eaf1ff;
  padding-bottom: 12px;
}

.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #222;
  font-size: 0.95rem;
}

.input,
.textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #2566d8;
  box-shadow: 0 0 0 3px rgba(37, 102, 216, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 0.85rem;
  color: #888;
}

.logo-upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo-preview {
  width: 150px;
  height: 150px;
  border: 2px dashed #d0d7e2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.preview-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.upload-controls {
  display: flex;
  gap: 12px;
}

.upload-tip {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2566d8;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #174ea6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 102, 216, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #222;
  border: 1px solid #d0d7e2;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-danger:hover:not(:disabled) {
  background: #f5c6cb;
  color: #491217;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 预览区域样式 */
.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section h4 {
  font-size: 1.1rem;
  color: #222;
  margin-bottom: 12px;
  font-weight: 500;
}

.navbar-preview {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
  background: #fff;
  padding: 4px;
}

.brand-name {
  font-size: 1.3rem;
  font-weight: 600;
}

.navbar-slogan {
  font-size: 0.9rem;
  opacity: 0.9;
}

.footer-preview {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.footer-text {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 1024px) {
  .brand-settings {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .brand-settings {
    width: 95%;
    padding: 0;
  }

  .settings-card,
  .preview-card {
    padding: 16px;
  }

  .settings-form {
    max-width: 100%;
  }

  .input,
  .textarea {
    font-size: 14px;
    padding: 10px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .form-actions {
    flex-direction: column;
  }

  .navbar-preview {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .logo-preview {
    width: 120px;
    height: 120px;
  }
}
</style>