<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>HTML文件转换导入</h3>
        <button class="modal-close" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="import-section">
          <label>HTML转换说明：</label>
          <div class="format-help">
            <p>支持以下HTML内容：</p>
            <p>1. 网页书签文件</p>
            <p>2. 包含链接的HTML页面</p>
            <p>3. 自动提取页面中的 &lt;a&gt; 标签</p>
            <p>4. 支持AI辅助解析和分类</p>
          </div>
        </div>
        <div class="import-section">
          <label>选择目标分类：</label>
          <div class="category-selector">
            <select v-model="htmlImportTargetMenuId" class="input category-select" @change="onHtmlImportMenuChange">
              <option value="">选择主分类...</option>
              <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
            </select>
            <select v-model="htmlImportTargetSubMenuId" class="input category-select">
              <option value="">精选</option>
              <option v-for="subMenu in htmlImportTargetSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
            </select>
          </div>
        </div>
        <div class="import-section">
          <label>上传HTML文件：</label>
          <input type="file" @change="handleHtmlFileUpload" accept=".html,.htm" class="input wide" />
        </div>
        <div class="import-section" v-if="htmlPreview.length > 0">
          <label>解析结果（前5条）：</label>
          <div class="html-preview">
            <div v-for="(item, index) in htmlPreview.slice(0, 5)" :key="index" class="preview-item">
              <div><strong>标题:</strong> {{ item.title }}</div>
              <div><strong>网址:</strong> {{ item.url }}</div>
              <div v-if="item.description"><strong>描述:</strong> {{ item.description }}</div>
            </div>
          </div>
          <p class="preview-count">共解析到 {{ htmlPreview.length }} 个链接</p>
          <div class="ai-assist-section">
            <label>
              <input type="checkbox" v-model="useAiAssist" /> 使用AI辅助优化标题和描述
            </label>
            <p class="ai-help-text">AI将帮助改善网站标题、生成描述，并自动获取最佳logo</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn" @click="importFromHtml" :disabled="!htmlImportTargetMenuId || htmlPreview.length === 0">
          导入 {{ htmlPreview.length }} 个网站
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { addCard as apiAddCard } from '@/api';

const props = defineProps({
  visible: Boolean,
  menus: Array
});

const emit = defineEmits(['close', 'imported']);

const htmlImportTargetMenuId = ref('');
const htmlImportTargetSubMenuId = ref('');
const htmlPreview = ref([]);
const useAiAssist = ref(true);

const htmlImportTargetSubMenus = computed(() => {
  if (!htmlImportTargetMenuId.value) return [];
  const menu = props.menus.find(m => m.id === htmlImportTargetMenuId.value);
  return menu?.subMenus || [];
});

function onHtmlImportMenuChange() {
  htmlImportTargetSubMenuId.value = '';
}

function close() {
  emit('close');
}

function handleHtmlFileUpload(event) {
  const file = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const htmlContent = e.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

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
            description: desc
          });
        }
      });

      const uniqueData = [];
      const seen = new Set();

      for (const item of parsedData) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          uniqueData.push(item);
        }
      }

      htmlPreview.value = uniqueData;

      if (htmlPreview.value.length === 0) {
        alert('HTML文件中未找到有效的链接');
      }
    } catch (error) {
      alert('HTML文件解析错误：' + error.message);
    }
  };
  reader.readAsText(file[0]);
}

async function importFromHtml() {
  if (!htmlImportTargetMenuId.value || htmlPreview.value.length === 0) return;

  const targetMenuId = parseInt(htmlImportTargetMenuId.value);
  const targetSubMenuId = htmlImportTargetSubMenuId.value ? parseInt(htmlImportTargetSubMenuId.value) : null;

  try {
    let dataToImport = htmlPreview.value;

    if (useAiAssist.value) {
      dataToImport = await enhanceWithAI(htmlPreview.value);
    }

    for (const item of dataToImport) {
      await apiAddCard({
        menu_id: targetMenuId,
        sub_menu_id: targetSubMenuId,
        title: item.title,
        url: item.url,
        logo_url: item.logo_url,
        description: item.description,
        sort_order: 0
      });
    }

    const importedCount = dataToImport.length;
    emit('imported');
    alert(`成功导入 ${importedCount} 个网站`);
    close();
  } catch (error) {
    alert('HTML导入失败：' + error.message);
  }
}

async function enhanceWithAI(data) {
  const enhanced = [];

  for (const item of data) {
    try {
      const url = new URL(item.url);
      const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;

      enhanced.push({
        ...item,
        logo_url: faviconUrl,
        description: item.description || `来自 ${url.hostname} 的网站`
      });
    } catch {
      enhanced.push(item);
    }
  }

  return enhanced;
}
</script>

<style scoped>
/* Styles are identical to BatchImportModal.vue, so they are omitted for brevity. */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}
.import-section {
  margin-bottom: 20px;
}

.import-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.format-help {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.format-help p {
  margin: 4px 0;
  font-size: 0.85rem;
  color: #6b7280;
}
.html-preview {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}
.preview-item {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}
.preview-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.preview-item div {
  font-size: 0.85rem;
  margin: 2px 0;
}
.preview-count {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}
.ai-assist-section {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
}
.ai-assist-section label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #0369a1;
  font-weight: 500;
}
.ai-help-text {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #0369a1;
}
.category-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-select {
  flex: 1;
  min-width: 140px;
}
.input.wide {
  width: 200px;
}
.btn {
  padding: 10px 8px;
  border: none;
  border-radius: 8px;
  background: #399dff;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background: #4b5563;
}
.btn:hover {
  background: #2d7dd2;
  transform: translateY(-1px);
}
.input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
</style>