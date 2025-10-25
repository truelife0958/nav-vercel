<template>
  <div class="import-modal">
    <!-- JSON导入对话框 -->
    <div v-if="showJsonImport" class="modal-overlay" @click="closeJsonImport">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>JSON文件导入</h3>
          <button class="modal-close" @click="closeJsonImport">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="import-section">
            <label>JSON格式说明：</label>
            <div class="format-help">
              <p>支持以下JSON格式：</p>
              <p>1. 数组格式：<code>[{"title": "标题", "url": "网址", "logo_url": "logo", "desc": "描述"}]</code></p>
              <p>2. 书签格式：Chrome/Firefox导出的书签文件</p>
              <p>3. 自定义格式：包含网站信息的JSON文件</p>
            </div>
          </div>
          <div class="import-section">
            <label>选择目标分类：</label>
            <select v-model="jsonImportTargetCategory" class="input wide">
              <option value="">选择分类...</option>
              <option v-for="option in menuOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="import-section">
            <label>上传JSON文件：</label>
            <input type="file" @change="handleJsonFileUpload" accept=".json" class="input wide" />
          </div>
          <div class="import-section" v-if="jsonPreview.length > 0">
            <label>预览数据（前5条）：</label>
            <div class="json-preview">
              <div v-for="(item, index) in jsonPreview.slice(0, 5)" :key="index" class="preview-item">
                <div><strong>标题:</strong> {{ item.title }}</div>
                <div><strong>网址:</strong> {{ item.url }}</div>
                <div v-if="item.logo_url"><strong>Logo:</strong> {{ item.logo_url }}</div>
                <div v-if="item.desc"><strong>描述:</strong> {{ item.desc }}</div>
              </div>
            </div>
            <p class="preview-count">共解析到 {{ jsonPreview.length }} 个网站</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeJsonImport">取消</button>
          <button class="btn" @click="importFromJson" :disabled="!jsonImportTargetCategory || jsonPreview.length === 0">
            导入 {{ jsonPreview.length }} 个网站
          </button>
        </div>
      </div>
    </div>

    <!-- HTML转换对话框 -->
    <div v-if="showHtmlImport" class="modal-overlay" @click="closeHtmlImport">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>HTML文件转换导入</h3>
          <button class="modal-close" @click="closeHtmlImport">
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
            <select v-model="htmlImportTargetCategory" class="input wide">
              <option value="">选择分类...</option>
              <option v-for="option in menuOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
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
                <div v-if="item.desc"><strong>描述:</strong> {{ item.desc }}</div>
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
          <button class="btn btn-secondary" @click="closeHtmlImport">取消</button>
          <button class="btn" @click="importFromHtml" :disabled="!htmlImportTargetCategory || htmlPreview.length === 0">
            导入 {{ htmlPreview.length }} 个网站
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  showJsonImport: Boolean,
  showHtmlImport: Boolean,
  menuOptions: Array,
  onImportCard: Function
});

const emit = defineEmits(['close-json', 'close-html', 'import-success']);

// JSON导入相关状态
const jsonImportTargetCategory = ref('');
const jsonPreview = ref([]);

// HTML导入相关状态
const htmlImportTargetCategory = ref('');
const htmlPreview = ref([]);
const useAiAssist = ref(true);

// JSON文件导入相关方法
function handleJsonFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      let data = JSON.parse(content);

      // 解析不同格式的JSON
      let parsedData = [];

      if (Array.isArray(data)) {
        // 标准数组格式
        parsedData = data.map(item => ({
          title: item.title || item.name || '未命名',
          url: item.url || item.href || '',
          logo_url: item.logo_url || item.icon || '',
          desc: item.desc || item.description || ''
        }));
      } else if (data.bookmarks) {
        // Chrome书签格式
        parsedData = extractBookmarks(data.bookmarks);
      } else if (data.children) {
        // Firefox书签格式
        parsedData = extractBookmarks(data.children);
      } else {
        // 单个对象
        parsedData = [{
          title: data.title || data.name || '未命名',
          url: data.url || data.href || '',
          logo_url: data.logo_url || data.icon || '',
          desc: data.desc || data.description || ''
        }];
      }

      // 过滤有效的URL
      jsonPreview.value = parsedData.filter(item => item.url && item.url.startsWith('http'));

      if (jsonPreview.value.length === 0) {
        alert('未找到有效的网站链接');
      }
    } catch (error) {
      alert('JSON文件格式错误：' + error.message);
    }
  };
  reader.readAsText(file);
}

function extractBookmarks(bookmarks) {
  let results = [];

  function traverse(items) {
    for (const item of items) {
      if (item.url) {
        results.push({
          title: item.name || item.title || '未命名',
          url: item.url,
          logo_url: '',
          desc: ''
        });
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  }

  traverse(bookmarks);
  return results;
}

async function importFromJson() {
  if (!jsonImportTargetCategory.value || jsonPreview.value.length === 0) return;

  const [menuId, subMenuId] = jsonImportTargetCategory.value.split('-');
  const targetMenuId = parseInt(menuId);
  const targetSubMenuId = subMenuId ? parseInt(subMenuId) : null;

  try {
    for (const item of jsonPreview.value) {
      await props.onImportCard({
        menu_id: targetMenuId,
        sub_menu_id: targetSubMenuId,
        title: item.title,
        url: item.url,
        logo_url: item.logo_url,
        desc: item.desc,
        order: 0
      });
    }

    emit('import-success', jsonPreview.value.length);
    closeJsonImport();
  } catch (error) {
    alert('JSON导入失败：' + error.message);
  }
}

// HTML文件导入相关方法
function handleHtmlFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

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

      htmlPreview.value = uniqueData;

      if (htmlPreview.value.length === 0) {
        alert('HTML文件中未找到有效的链接');
      }
    } catch (error) {
      alert('HTML文件解析错误：' + error.message);
    }
  };
  reader.readAsText(file);
}

async function importFromHtml() {
  if (!htmlImportTargetCategory.value || htmlPreview.value.length === 0) return;

  const [menuId, subMenuId] = htmlImportTargetCategory.value.split('-');
  const targetMenuId = parseInt(menuId);
  const targetSubMenuId = subMenuId ? parseInt(subMenuId) : null;

  try {
    let dataToImport = htmlPreview.value;

    // 如果启用AI辅助，则处理数据
    if (useAiAssist.value) {
      dataToImport = await enhanceWithAI(htmlPreview.value);
    }

    for (const item of dataToImport) {
      await props.onImportCard({
        menu_id: targetMenuId,
        sub_menu_id: targetSubMenuId,
        title: item.title,
        url: item.url,
        logo_url: item.logo_url,
        desc: item.desc,
        order: 0
      });
    }

    emit('import-success', dataToImport.length);
    closeHtmlImport();
  } catch (error) {
    alert('HTML导入失败：' + error.message);
  }
}

// AI辅助增强功能
async function enhanceWithAI(data) {
  // 这里可以集成AI API来优化标题和描述
  // 目前返回原始数据，后续可以接入GPT等API
  const enhanced = [];

  for (const item of data) {
    try {
      // 自动生成favicon URL
      const url = new URL(item.url);
      const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;

      enhanced.push({
        ...item,
        logo_url: faviconUrl,
        desc: item.desc || `来自 ${url.hostname} 的网站`
      });
    } catch {
      enhanced.push(item);
    }
  }

  return enhanced;
}

function closeJsonImport() {
  jsonPreview.value = [];
  jsonImportTargetCategory.value = '';
  emit('close-json');
}

function closeHtmlImport() {
  htmlPreview.value = [];
  htmlImportTargetCategory.value = '';
  useAiAssist.value = true;
  emit('close-html');
}
</script>

<style scoped>
.input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input.wide {
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: #399dff;
  box-shadow: 0 0 0 3px rgba(57, 157, 255, 0.1);
}

.btn {
  padding: 10px 16px;
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

.btn:hover {
  background: #2d7dd2;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* 模态框样式 */
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

.format-help code {
  background: #e5e7eb;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.8rem;
}

.json-preview, .html-preview {
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
</style>