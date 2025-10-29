<template>
  <div class="batch-toolbar" v-if="subMenus.length > 0">
    <div class="batch-selection">
      <label class="checkbox-container">
        <input
          type="checkbox"
          :checked="isAllSelected"
          @change="$emit('toggle-select-all')"
          class="batch-checkbox"
        />
        <span class="checkmark"></span>
        全选 ({{ selectedSubMenus.length }}/{{ subMenus.length }})
      </label>
    </div>

    <div class="batch-actions" v-if="selectedSubMenus.length > 0">
      <div class="batch-move-section">
        <span class="batch-label">批量移动到主菜单：</span>
        <select :value="batchMoveMenuId" @change="$emit('update:batchMoveMenuId', $event.target.value)" class="input narrow batch-select">
          <option value="">选择目标主菜单...</option>
          <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
        </select>
        <button class="btn btn-batch" @click="$emit('execute-batch-move')" :disabled="!batchMoveMenuId">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7h10v10M17 7L7 17"/>
          </svg>
          移动 ({{ selectedSubMenus.length }})
        </button>
      </div>
      <button class="btn btn-danger" @click="$emit('batch-delete')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          <path d="M10 11v6M14 11v6"/>
        </svg>
        删除 ({{ selectedSubMenus.length }})
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'subMenus',
  'selectedSubMenus',
  'isAllSelected',
  'menus',
  'batchMoveMenuId'
]);

defineEmits([
  'toggle-select-all',
  'update:batchMoveMenuId',
  'execute-batch-move',
  'batch-delete'
]);
</script>

<style scoped>
.batch-toolbar {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 32px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  border: 2px solid #bfdbfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.batch-selection {
  display: flex;
  align-items: center;
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
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.batch-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-batch {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-batch:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-batch:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
  min-width: 180px;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.batch-select {
  cursor: pointer;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  color: #1e293b;
}

.batch-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  margin-right: 10px;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox-container:hover .checkmark {
  border-color: #3b82f6;
}

.batch-checkbox:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.batch-checkbox:checked ~ .checkmark:after {
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-toolbar {
    flex-direction: column;
    align-items: stretch;
    margin: 12px 20px;
    padding: 12px 16px;
  }

  .batch-selection {
    justify-content: center;
  }

  .batch-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-move-section {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .batch-label {
    text-align: center;
  }

  .input {
    min-width: 0;
    width: 100%;
  }

  .btn {
    justify-content: center;
  }
}
</style>