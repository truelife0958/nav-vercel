<template>
  <div class="batch-toolbar" v-if="cards.length > 0">
    <div class="batch-selection">
      <label class="checkbox-container">
        <input
          type="checkbox"
          :checked="isAllSelected"
          @change="$emit('toggle-select-all')"
          class="batch-checkbox"
        />
        <span class="checkmark"></span>
        全选 ({{ selectedCards.length }}/{{ cards.length }})
      </label>
    </div>

    <div class="batch-actions" v-if="selectedCards.length > 0">
      <div class="batch-move-section">
        <span class="batch-label">移动到：</span>
        <select :value="batchMoveMenuId" @change="$emit('update:batchMoveMenuId', $event.target.value)" class="input narrow batch-select">
          <option value="">选择主分类...</option>
          <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
        </select>
        <select :value="batchMoveSubMenuId" @change="$emit('update:batchMoveSubMenuId', $event.target.value)" class="input narrow batch-select">
          <option value="">精选</option>
          <option v-for="subMenu in batchMoveSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
        </select>
        <button class="btn btn-batch" @click="$emit('execute-batch-move')" :disabled="!batchMoveMenuId">移动</button>
      </div>
      <button class="btn btn-batch" @click="$emit('batch-copy')">复制 ({{ selectedCards.length }})</button>
      <button class="btn btn-batch" @click="$emit('batch-paste')" :disabled="copiedCards.length === 0">粘贴 ({{ copiedCards.length }})</button>
      <button class="btn btn-update-icons" @click="$emit('batch-update-icons')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        更新图标 ({{ selectedCards.length }})
      </button>
      <button class="btn btn-danger" @click="$emit('batch-delete')">删除 ({{ selectedCards.length }})</button>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'cards',
  'selectedCards',
  'isAllSelected',
  'menus',
  'batchMoveMenuId',
  'batchMoveSubMenuId',
  'batchMoveSubMenus',
  'copiedCards'
]);

defineEmits([
  'toggle-select-all',
  'update:batchMoveMenuId',
  'update:batchMoveSubMenuId',
  'execute-batch-move',
  'batch-copy',
  'batch-paste',
  'batch-update-icons',
  'batch-delete'
]);
</script>

<style scoped>
.batch-toolbar {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.batch-move-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-batch {
  background: #6366f1;
  color: white;
}
.btn-update-icons {
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-update-icons:hover {
  background: #059669;
}
.btn-update-icons:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
.btn-danger { background: #ef4444; color: white; }
.input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
}
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.checkmark {
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
}
input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>