<template>
  <div class="card-header">
    <div class="header-content">
      <h2 class="page-title">管理网站导航卡片</h2>
      <p class="subtitle">支持精选和子菜单分类，批量导入、JSON文件导入、HTML转换及AI辅助优化</p>
    </div>
    <div class="card-add">
      <select :value="selectedMenuId" @change="$emit('update:selectedMenuId', parseInt($event.target.value, 10))" class="input narrow">
        <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
      </select>
      <select :value="selectedSubMenuId" @change="$emit('update:selectedSubMenuId', $event.target.value === '' ? '' : parseInt($event.target.value, 10))" class="input narrow">
        <option value="">精选</option>
        <option v-for="subMenu in currentSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
      </select>
      <input :value="newCardTitle" @input="$emit('update:newCardTitle', $event.target.value)" placeholder="卡片标题" class="input narrow" />
      <input :value="newCardUrl" @input="$emit('update:newCardUrl', $event.target.value)" placeholder="卡片链接" class="input wide" />
      <input :value="newCardLogo" @input="$emit('update:newCardLogo', $event.target.value)" placeholder="logo链接(可选)" class="input wide" />
      <button class="btn" @click="$emit('add-card')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        添加卡片
      </button>
      <button class="btn btn-batch" @click="$emit('show-batch-import')">批量导入</button>
      <button class="btn btn-batch" @click="$emit('show-json-import')">JSON导入</button>
      <button class="btn btn-batch" @click="$emit('show-html-import')">HTML转换</button>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'menus',
  'selectedMenuId',
  'selectedSubMenuId',
  'currentSubMenus',
  'newCardTitle',
  'newCardUrl',
  'newCardLogo'
]);

defineEmits([
  'update:selectedMenuId',
  'update:selectedSubMenuId',
  'update:newCardTitle',
  'update:newCardUrl',
  'update:newCardLogo',
  'add-card',
  'show-batch-import',
  'show-json-import',
  'show-html-import'
]);
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  width: 95%;
  text-align: center;
}
.header-content {
  margin-bottom: 15px;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}
.card-add {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
}
.input.narrow { width: 140px; }
.input.wide { width: 200px; }
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #399dff;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-batch { background: #6366f1; }
</style>