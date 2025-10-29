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
// Props类型验证和默认值
defineProps({
  subMenus: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedSubMenus: {
    type: Array,
    required: true,
    default: () => []
  },
  isAllSelected: {
    type: Boolean,
    required: true,
    default: false
  },
  menus: {
    type: Array,
    required: true,
    default: () => []
  },
  batchMoveMenuId: {
    type: [String, Number],
    default: ''
  }
});

// 事件定义
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
  border-radius: 16px;
  padding: 18px 24px;
  margin: 16px 32px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  border: 2px solid rgba(191, 219, 254, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  animation: slideDown 0.4s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-toolbar:hover {
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.2);
  border-color: rgba(191, 219, 254, 1);
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
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-batch::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-batch:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.btn-batch:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-batch:active:not(:disabled) {
  transform: translateY(0);
}

.btn-batch:disabled {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-danger::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-danger:hover::before {
  width: 300px;
  height: 300px;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
}

.btn-danger:active {
  transform: translateY(0);
}

.input {
  padding: 9px 14px;
  border-radius: 10px;
  border: 2px solid rgba(203, 213, 225, 0.8);
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 180px;
}

.input:hover {
  border-color: rgba(59, 130, 246, 0.4);
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
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
  height: 22px;
  width: 22px;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 7px;
  margin-right: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.checkbox-container:hover .checkmark {
  border-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.2);
}

.batch-checkbox:checked ~ .checkmark {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  animation: checkPop 0.3s ease-out;
}

@keyframes checkPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
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